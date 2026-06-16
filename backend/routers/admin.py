from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, File, UploadFile, Query, UploadFile
from sqlalchemy.orm import Session, joinedload
from db_connection import get_db, SessionLocal
from db_model import Appointment, SystemSettings, User, roleEnum, Staff, SystemLogs, actionTypeEnum, Department, Doctor, Schedule, weekDayEnum, SystemHealthLog, AppointmentStatus, CalendarEvent, Patient
from security import get_password_hash, get_current_user, verify_token
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from email_utils import send_personnel_credentials_email, send_personnel_update_email
from datetime import datetime, date, timedelta
from sqlalchemy import func, text, extract, or_, desc, case
from passlib.context import CryptContext
from .backup_utils import perform_database_backup
from zoneinfo import ZoneInfo
from fastapi.responses import StreamingResponse
from sse_manager import notifier
from dateutil.relativedelta import relativedelta
import subprocess
import asyncio
import calendar
import random
import time
import psutil
import tempfile
import cloudinary
import cloudinary.uploader
import os
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------
def create_system_log(db: Session, user_id: int, action: actionTypeEnum, table: str, details: str, request: Request, target: str = None):
   
    new_log = SystemLogs(
        userID=user_id,
        actionType=action,
        tableAffected=table,
        target=target,
        details=details,
        ipAddress=request.client.host 
    )
    db.add(new_log)
    db.commit()

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class PersonnelCreate(BaseModel):
    employeeID: Optional[str] = None
    firstname: str
    middlename: Optional[str] = ""
    surname: str
    email: EmailStr
    role: str 
    position: str
    gender: Optional[str] = None
    contactNumber: Optional[str] = None
    workingDays: Optional[str] = "Unassigned" 
    workingHours: Optional[str] = "Unassigned"

class PersonnelUpdate(BaseModel):
    firstname: str
    surname: str
    role: str 
    position: str
    gender: Optional[str] = None
    contactNumber: Optional[str] = None
    status: str # 

class PersonnelPageUpdate(BaseModel):
    employeeID: Optional[str] = None
    firstname: str 
    middlename: Optional[str] = ""
    surname: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: str
    contactNumber: Optional[str] = None
    gender: Optional[str] = None
    workingDays: Optional[str] = None
    workingHours: Optional[str] = None

class DoctorCreate(BaseModel):
    employeeID: Optional[str] = None
    firstname: str
    middlename: Optional[str] = ""
    surname: str
    licenseNumber: str
    email: EmailStr
    contactNumber: Optional[str] = None
    deptID: int
    schedules: List['DoctorScheduleItem'] = []

class DoctorScheduleItem(BaseModel):
    days: List[str]
    startTime: str
    endTime: str
    slot: int

class DoctorUpdate(BaseModel):
    firstname: str 
    middlename: Optional[str] = ""
    surname: str
    contactNumber: Optional[str] = None
    deptID: Optional[int] = None
    employeeID: str     
    licenseNumber: str
    email: Optional[EmailStr] = None

class ScheduleBlockCreate(BaseModel):
    days: str 
    timePeriod: str 
    maxPatients: int

class DepartmentCreateUpdate(BaseModel):
    department: str
    type: str

class AppointmentAction(BaseModel):
    status: str 
    reason: Optional[str] = None

class ProfileUpdate(BaseModel):
    firstname: str
    surname: str
    middlename: Optional[str] = ""
    mi: Optional[str]= ""
    suffix: Optional[str] = ""
    contactNumber: str
    dob: Optional[str] = None
    gender: str = "Prefer not to say"
    street: str
    barangay: str
    city: str
    province: str
    postalCode: str

class EmailChangeRequest(BaseModel):
    current_password: str
    new_email: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str  
    type: str  

class CapacityUpdate(BaseModel):
    daily_capacity: int

class UserStatusUpdate(BaseModel):
    status: str

class PatientStatusUpdate(BaseModel):
    status: str

# ---------------------------------------------------------
# 1. ADMIN & USER MANAGEMENT
# ---------------------------------------------------------
@router.get("/users")
def get_hospital_personnel(db: Session = Depends(get_db)):
    users = db.query(User).options(joinedload(User.staff_profile)).filter(
        User.role.in_([roleEnum.Admin, roleEnum.Staff])
    ).all()
    
    formatted_users = []
    for u in users:
        if u.staff_profile:
            full_name = f"{u.staff_profile.firstname} {u.staff_profile.surname}"
            display_id = f"STF-{u.staff_profile.staffID:04d}" 
        else:
            full_name = "System Admin"
            display_id = f"ADM-{u.userID:04d}"

        join_date = u.createdDate.strftime("%m/%d/%Y") if u.createdDate else "N/A"
        current_status = "Active" if u.isActive else "Deactivated"

        formatted_users.append({
            "raw_id": u.userID, "id": display_id, "name": full_name,
            "firstname": u.staff_profile.firstname if u.staff_profile else "System",
            "surname": u.staff_profile.surname if u.staff_profile else "Admin",
            "role": u.role.value,
            "position": u.staff_profile.position if u.staff_profile else "System Administrator",
            "email": u.email,
            "gender": u.staff_profile.gender if u.staff_profile and u.staff_profile.gender else "N/A",
            "phone": u.staff_profile.contactNumber if u.staff_profile and u.staff_profile.contactNumber else "N/A",
            "status": current_status, "joinDate": join_date
        })
    return formatted_users

@router.put("/users/{user_id}/status")
def toggle_user_status(user_id: int, data: UserStatusUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")

    is_activating = (data.status == "Active")
    user.isActive = is_activating

    target_name = f"{user.staff_profile.firstname} {user.staff_profile.surname}" if user.staff_profile else "System Admin"
    action = actionTypeEnum.UPDATE if is_activating else actionTypeEnum.DELETE
    
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=action, tableAffected="userTable",
        target=target_name, # TARGET ADDED
        details=f"{'Reactivated' if is_activating else 'Deactivated'} account for: {target_name}",
        ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({"title": "User Status Updated", "desc": f"Updated status for User: {target_name}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": f"User status successfully updated to {data.status}"}

# ---------------------------------------------------------
# 2. USER CREATION
# ---------------------------------------------------------
@router.post("/addusers")
def create_personnel(data: PersonnelCreate, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user: raise HTTPException(status_code=400, detail="Email is already registered.")

    emp_id = data.employeeID.strip() if data.employeeID and data.employeeID.strip() else None
    if emp_id is not None and db.query(Staff).filter(Staff.employeeID == emp_id).first():
        raise HTTPException(status_code=400, detail="Employee ID is already in use.")

    assigned_role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff
    raw_password = f"Gabay{random.randint(1000, 9999)}!" 
    hashed_password = get_password_hash(raw_password)
    
    new_user = User(email=data.email, passwordHash=hashed_password, role=assigned_role, isActive=True, is_verified=True)
    db.add(new_user)
    db.flush() 

    new_staff = Staff(
        userID=new_user.userID, employeeID=emp_id, firstname=data.firstname, middlename=data.middlename, surname=data.surname,
        position=data.position, gender=data.gender, contactNumber=data.contactNumber, workingDays=data.workingDays, workingHours=data.workingHours
    )
    db.add(new_staff)
    
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.INSERT, tableAffected="userTable",
        target=f"{data.firstname} {data.surname}", # TARGET ADDED
        details=f"Created {data.role} account: {data.firstname} {data.surname}", ipAddress=request.client.host
    ))
    db.commit()

    background_tasks.add_task(send_personnel_credentials_email, recipient_email=data.email, name=f"{data.firstname} {data.surname}", role=data.role, raw_password=raw_password)
    return {"message": f"{data.firstname}'s account was created successfully!"}

# ---------------------------------------------------------
# 3. USER UPDATING & DELETION
# ---------------------------------------------------------
@router.put("/users/{user_id}")
def update_personnel(user_id: int, data: PersonnelUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")

    user.role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff
    user.isActive = True if data.status == "Active" else False

    if user.staff_profile:
        user.staff_profile.firstname = data.firstname
        user.staff_profile.surname = data.surname
        user.staff_profile.position = data.position
        user.staff_profile.gender = data.gender
        user.staff_profile.contactNumber = data.contactNumber

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="userTable/staffTable",
        target=f"{data.firstname} {data.surname}", 
        details=f"Updated profile for: {data.firstname} {data.surname} (Status: {data.status})", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Account successfully updated and logged!"}

@router.delete("/users/{user_id}")
def deactivate_personnel(user_id: int, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")

    target_name = f"{user.staff_profile.firstname} {user.staff_profile.surname}" if user.staff_profile else "Unknown Staff"
    user.isActive = False

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.DELETE, tableAffected="userTable",
        target=target_name,
        details=f"Deactivated account for: {target_name} (Email: {user.email})", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({"title": "User Status Updated", "desc": f"Updated status for User: {target_name}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": f"Account for {target_name} has been deactivated and logged."}

# ---------------------------------------------------------
# 4. AUDIT LOGS
# ---------------------------------------------------------
@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(SystemLogs).options(
        joinedload(SystemLogs.user).joinedload(User.staff_profile),
        joinedload(SystemLogs.user).joinedload(User.patient_profile)
    ).order_by(SystemLogs.timestamp.desc()).all()

    formatted_logs = []
    for log in logs:
        user_name = "Unknown / Deleted User"
        role_name = "SYSTEM"

        if log.user:
            role_name = log.user.role.value.upper()
            if log.user.staff_profile:
                user_name = f"{log.user.staff_profile.firstname} {log.user.staff_profile.surname}"
            elif log.user.patient_profile:
                user_name = f"{log.user.patient_profile.firstname} {log.user.patient_profile.surname}"
            else:
                user_name = "Master Admin"

        formatted_logs.append({
            "id": f"LOG-{log.logID:04d}",
            "date": log.timestamp.strftime("%m/%d/%Y") if log.timestamp else "N/A",
            "time": log.timestamp.strftime("%I:%M:%S %p") if log.timestamp else "N/A",
            "rawDate": log.timestamp.isoformat() if log.timestamp else None,
            "user": user_name,
            "role": role_name,
            "action": log.actionType.value if log.actionType else "SYSTEM",
            "target": getattr(log, 'target', None) or '—', 
            "description": log.details or f"Modified {log.tableAffected}",
            "ip": log.ipAddress or "Localhost"
        })
        
    return formatted_logs

# ---------------------------------------------------------
# 5. PERSONNEL PAGE MANAGEMENT
# ---------------------------------------------------------
@router.get("/personnel")
def get_personnel_list(db: Session = Depends(get_db)):
    users = db.query(User).options(joinedload(User.staff_profile)).filter(User.role.in_([roleEnum.Admin, roleEnum.Staff])).all()
    formatted_personnel = []
    
    for u in users:
        name = "System Admin"
        emp_id = "N/A"
        staff_db_id = "N/A"
        schedule = "Unassigned"
        time_slot = "Unassigned"
        email_str = u.email
        phone_str = "N/A"
        gender_str = "N/A"
        dob_str = "N/A"
        address_str = "N/A" 

        if u.staff_profile:
            middle_init = f" {u.staff_profile.middlename[0]}." if u.staff_profile.middlename else ""
            name = f"{u.staff_profile.firstname}{middle_init} {u.staff_profile.surname}"
            emp_id = u.staff_profile.employeeID if u.staff_profile.employeeID else "Unassigned"
            staff_db_id = f"STF-{u.staff_profile.staffID:04d}"
            schedule = u.staff_profile.workingDays or "Unassigned"
            time_slot = u.staff_profile.workingHours or "Unassigned"
            phone_str = u.staff_profile.contactNumber or "N/A"
            gender_str = u.staff_profile.gender or "N/A"
            address_str = u.staff_profile.address or "N/A" 
            if getattr(u.staff_profile, 'dob', None): dob_str = u.staff_profile.dob.strftime("%m/%d/%Y")

        formatted_personnel.append({
            "raw_id": u.userID, "id": emp_id, "staffID": staff_db_id, "role": u.role.value.upper(), "name": name,
            "firstname": u.staff_profile.firstname if u.staff_profile else "System",
            "middlename": u.staff_profile.middlename if u.staff_profile else "",
            "surname": u.staff_profile.surname if u.staff_profile else "Admin",      
            "schedule": schedule, "time": time_slot, "status": "Active" if u.isActive else "Deactivated",
            "email": email_str, "phone": phone_str, "gender": gender_str, "dob": dob_str,
            "address": address_str 
        })

    day_map_reverse = { "Monday": "M", "Tuesday": "T", "Wednesday": "W", "Thursday": "TH", "Friday": "F", "Saturday": "S", "Sunday": "SU" }
    doctors = db.query(Doctor).options(joinedload(Doctor.department), joinedload(Doctor.schedule)).all()

    for d in doctors:
        schedule_str = "Unassigned"
        time_str = "Unassigned"
        slot_str = "N/A"
        sched_list = []
        
        if d.schedule:
            for s in d.schedule:
                start = s.startTime.strftime("%I:%M %p").lstrip("0")
                end = s.endTime.strftime("%I:%M %p").lstrip("0")
                sched_list.append({
                    "id": s.scheduleID, "day": s.weekDay.value, "time": f"{start} - {end}", "maxPatients": s.maxPatients
                })
            
            short_days = [day_map_reverse.get(s.weekDay.value, s.weekDay.value) for s in d.schedule]
            schedule_str = ", ".join(list(dict.fromkeys(short_days))) 
            
            if len(d.schedule) > 1:
                time_str = "Multiple Blocks"
                slot_str = f"Avg {int(sum(s.maxPatients for s in d.schedule)/len(d.schedule))}"
            else:
                time_str = f"{d.schedule[0].startTime.strftime('%I:%M %p').lstrip('0')} - {d.schedule[0].endTime.strftime('%I:%M %p').lstrip('0')}"
                slot_str = str(d.schedule[0].maxPatients)

        formatted_personnel.append({
            "raw_id": d.docID, "id": d.employeeID or "Unassigned", "docID": f"DOC-{d.docID:04d}", "role": "DOCTOR",
            "name": f"{d.firstname} {d.middlename + ' ' if d.middlename else ''}{d.surname}",
            "firstname": d.firstname, "middlename": d.middlename or "", "surname": d.surname,
            "licenseNumber": d.licenseNumber or "", "email": d.email or "", "phone": d.contactNumber or "",
            "dept": d.department.department if d.department else "N/A", "deptID": d.deptID,
            "isSpecialty": (d.department.type == "Specialty") if d.department else False,
            "schedule": schedule_str, "time": time_str, "slot": slot_str, "schedules": sched_list,
            "status": "Active" if d.isAvailable else "Deactivated"
        })
    return formatted_personnel

@router.put("/personnel/{person_id}")
def update_personnel_page(
    person_id: int, data: PersonnelPageUpdate, request: Request, background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)
):
    target_name = ""

    if data.role == "DOCTOR":
        doc = db.query(Doctor).filter(Doctor.docID == person_id).first()
        if not doc: raise HTTPException(status_code=404, detail="Doctor not found")
        
        doc.firstname = data.firstname
        doc.surname = data.surname

        if getattr(data, 'deptID', None) is not None: doc.deptID = getattr(data, 'deptID', None)
        elif getattr(data, 'deptIDs', None) and len(getattr(data, 'deptIDs', [])) > 0: doc.deptID = data.deptIDs[0]
            
        target_name = f"Dr. {data.firstname} {data.surname}"
        db.query(Schedule).filter(Schedule.docID == doc.docID).delete()
        
        day_map = {"M": weekDayEnum.Monday, "T": weekDayEnum.Tuesday, "W": weekDayEnum.Wednesday, "TH": weekDayEnum.Thursday, "F": weekDayEnum.Friday, "S": weekDayEnum.Saturday, "SU": weekDayEnum.Sunday}
        
        if data.workingDays != "Unassigned" and data.workingHours != "Unassigned":
            try:
                time_parts = data.workingHours.split(" - ")
                start_time = datetime.strptime(time_parts[0], "%I:%M %p").time()
                end_time = datetime.strptime(time_parts[1], "%I:%M %p").time()
                selected_days = [d.strip() for d in data.workingDays.split(",")]
                for day in selected_days:
                    if day in day_map:
                        db.add(Schedule(docID=doc.docID, weekDay=day_map[day], startTime=start_time, endTime=end_time, maxPatients=20))
            except Exception: pass 
    else:
        user = db.query(User).filter(User.userID == person_id).first()
        if not user: raise HTTPException(status_code=404, detail="Staff not found")

        emp_id = data.employeeID.strip() if data.employeeID and data.employeeID.strip() and data.employeeID.strip().lower() != "unassigned" else None
        if emp_id is not None and db.query(Staff).filter(Staff.employeeID == emp_id, Staff.userID != person_id).first():
            raise HTTPException(status_code=400, detail="Employee ID is already in use by another account.")

        user.role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff
        updated_changes = {}

        if user.staff_profile:
            user.staff_profile.firstname = data.firstname
            user.staff_profile.middlename = data.middlename
            user.staff_profile.surname = data.surname
            user.staff_profile.employeeID = emp_id 
            user.staff_profile.workingDays = data.workingDays
            user.staff_profile.workingHours = data.workingHours
            
            if data.contactNumber: user.staff_profile.contactNumber = data.contactNumber
            if data.gender: user.staff_profile.gender = data.gender

            updated_changes["Employee ID"] = emp_id or "Unassigned"
            updated_changes["Full Name"] = f"{data.firstname} {data.surname}"
            updated_changes["System Role"] = user.role.value
            updated_changes["Working Days"] = data.workingDays
            updated_changes["Working Hours"] = data.workingHours

            target_name = f"{user.staff_profile.firstname} {user.staff_profile.surname}"

        target_email = user.email
        if data.email and data.email != user.email:
            if db.query(User).filter(User.email == data.email, User.userID != person_id).first():
                raise HTTPException(status_code=400, detail="Email is already connected to another account.")
            user.email = data.email
            target_email = data.email
            updated_changes["Email Address"] = data.email
        
        if data.password and data.password.strip() != "":
            user.passwordHash = get_password_hash(data.password)
            updated_changes["Password"] = "Changed by Administrator"

        background_tasks.add_task(send_personnel_update_email, recipient_email=target_email, name=target_name, changes=updated_changes)

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="staffTable",
        target=target_name,
        details=f"Updated assignment/profile for: {target_name}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({"title": "Personnel Status Updated", "desc": f"Updated status for Personnel: {target_name}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": "Personnel assignment updated successfully!"}

# ---------------------------------------------------------
# 6. DOCTOR LIST MANAGEMENT
# ---------------------------------------------------------
@router.post("/doctors")
def add_doctor(data: DoctorCreate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    emp_id = data.employeeID.strip() if data.employeeID and data.employeeID.strip() else None
    if emp_id and db.query(Doctor).filter(Doctor.employeeID == emp_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already in use.")

    new_doc = Doctor(
        employeeID=emp_id, firstname=data.firstname, middlename=data.middlename, surname=data.surname,
        licenseNumber=data.licenseNumber, email=data.email, contactNumber=data.contactNumber, deptID=data.deptID, isAvailable=True
    )
    db.add(new_doc)
    db.flush()

    day_map = { "M": weekDayEnum.Monday, "T": weekDayEnum.Tuesday, "W": weekDayEnum.Wednesday, "TH": weekDayEnum.Thursday, "F": weekDayEnum.Friday, "S": weekDayEnum.Saturday, "SU": weekDayEnum.Sunday }
    for block in data.schedules:
        try:
            start_time = datetime.strptime(block.startTime, "%H:%M").time()
            end_time = datetime.strptime(block.endTime, "%H:%M").time()
            for day in block.days:
                if day in day_map: db.add(Schedule(docID=new_doc.docID, weekDay=day_map[day], startTime=start_time, endTime=end_time, maxPatients=block.slot))
        except Exception: pass

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.INSERT, tableAffected="doctorTable", 
        target=f"Dr. {data.firstname} {data.surname}", # TARGET ADDED
        details=f"Registered Dr. {data.firstname} {data.surname}", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Doctor added successfully!"}

@router.put("/doctors/{doc_id}")
def update_doctor(doc_id: int, data: DoctorUpdate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    doc = db.query(Doctor).filter(Doctor.docID == doc_id).first()
    if not doc: raise HTTPException(status_code=404, detail="Doctor not found")
        
    updated_changes = {}
    if data.employeeID:
        emp_id = data.employeeID.strip()
        if emp_id and emp_id.lower() != "unassigned":
            if db.query(Doctor).filter(Doctor.employeeID == emp_id, Doctor.docID != doc_id).first():
                raise HTTPException(status_code=400, detail="Employee ID already in use.")
            if doc.employeeID != emp_id:
                doc.employeeID = emp_id
                updated_changes["Employee ID"] = emp_id

    if data.licenseNumber and doc.licenseNumber != data.licenseNumber:
        doc.licenseNumber = data.licenseNumber
        updated_changes["PRC License Number"] = data.licenseNumber
        
    target_email = doc.email
    if data.email and data.email != doc.email:
        if db.query(Doctor).filter(Doctor.email == data.email, Doctor.docID != doc_id).first():
            raise HTTPException(status_code=400, detail="Email is used by another doctor.")
        doc.email = data.email
        target_email = data.email
        updated_changes["Email Address"] = data.email

    doc.firstname = data.firstname
    doc.middlename = data.middlename
    doc.surname = data.surname
    doc.contactNumber = data.contactNumber
    if data.deptID: doc.deptID = data.deptID
    doc.employeeID = data.employeeID 
    doc.licenseNumber = data.licenseNumber
        
    target_name = f"Dr. {doc.firstname} {doc.surname}"
    if updated_changes and target_email:
        background_tasks.add_task(send_personnel_update_email, recipient_email=target_email, name=target_name, changes=updated_changes)

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="doctorTable", 
        target=target_name,
        details=f"Updated details for: {target_name}", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Doctor updated successfully!"}

@router.put("/doctors/{doc_id}/status")
def toggle_doctor_status(doc_id: int, data: UserStatusUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    doc = db.query(Doctor).filter(Doctor.docID == doc_id).first()
    is_activating = (data.status == "Active")
    doc.isAvailable = is_activating
    
    target_name = f"Dr. {doc.firstname} {doc.surname}"
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE if is_activating else actionTypeEnum.DELETE, tableAffected="doctorTable", 
        target=target_name, # TARGET ADDED
        details=f"{'Reactivated' if is_activating else 'Deactivated'} {target_name}", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": f"Doctor status updated to {data.status}"}

@router.post("/doctors/{doc_id}/schedules")
def add_schedule_block(doc_id: int, data: ScheduleBlockCreate, db: Session = Depends(get_db)):
    day_map = { "M": weekDayEnum.Monday, "T": weekDayEnum.Tuesday, "W": weekDayEnum.Wednesday, "TH": weekDayEnum.Thursday, "F": weekDayEnum.Friday, "S": weekDayEnum.Saturday, "SU": weekDayEnum.Sunday, "Monday": weekDayEnum.Monday, "Tuesday": weekDayEnum.Tuesday, "Wednesday": weekDayEnum.Wednesday, "Thursday": weekDayEnum.Thursday, "Friday": weekDayEnum.Friday, "Saturday": weekDayEnum.Saturday, "Sunday": weekDayEnum.Sunday }
    try:
        time_parts = data.timePeriod.split(" - ")
        start_time = datetime.strptime(time_parts[0], "%I:%M %p").time()
        end_time = datetime.strptime(time_parts[1], "%I:%M %p").time()
        
        selected_days = [d.strip() for d in data.days.split(",")]
        for day in selected_days:
            if day in day_map:
                db.add(Schedule(docID=doc_id, weekDay=day_map[day], startTime=start_time, endTime=end_time, maxPatients=data.maxPatients))
        db.commit()
        return {"message": "Schedules successfully saved!"}
    except Exception as e: raise HTTPException(status_code=400, detail=str(e))

@router.delete("/schedules/{sched_id}")
def delete_schedule(sched_id: int, db: Session = Depends(get_db)):
    sched = db.query(Schedule).filter(Schedule.scheduleID == sched_id).first()
    if sched:
        db.delete(sched)
        db.commit()
    return {"message": "Schedule deleted."}

# ---------------------------------------------------------
# 7. DEPARTMENT FETCHING
# ---------------------------------------------------------
@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).order_by(Department.department.asc()).all()
    return [{"deptID": d.deptID, "department": d.department, "type": d.type} for d in departments]

# ---------------------------------------------------------
# 8. DEPARTMENT MANAGEMENT
# ---------------------------------------------------------
@router.get("/departments/stats")
def get_department_stats(db: Session = Depends(get_db)):
    depts = db.query(Department).filter(Department.isActive == True).all()
    formatted_depts = []
    for d in depts:
        doc_count = db.query(Doctor).filter(Doctor.deptID == d.deptID).count()
        prefix = "SPEC" if d.type.upper() == "SPECIALTY" else "GEN"
        formatted_depts.append({"raw_id": d.deptID, "id": f"{prefix}-{d.deptID:03d}", "name": d.department, "type": d.type.upper(), "doctors": doc_count})
    return formatted_depts

@router.post("/departments")
def create_department(data: DepartmentCreateUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    new_dept = Department(department=data.department, type=data.type.capitalize(), isActive=True)
    db.add(new_dept)
    
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.INSERT, tableAffected="departmentTable",
        target=data.department, # TARGET ADDED
        details=f"Created new department: {data.department}", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Department Created", "desc": f"Created new department: {data.department}", "action": "INSERT", "timestamp": datetime.now().isoformat()})
    return {"message": "Department created successfully!"}

@router.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentCreateUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    dept = db.query(Department).filter(Department.deptID == dept_id).first()
    if not dept: raise HTTPException(status_code=404, detail="Department not found")

    dept.department = data.department
    dept.type = data.type.capitalize()

    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="departmentTable",
        target=data.department, # TARGET ADDED
        details=f"Updated department: {data.department}", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Department Updated", "desc": f"Updated department: {data.department}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": "Department updated successfully!"}

@router.delete("/departments/{dept_id}")
def deactivate_department(dept_id: int, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    dept = db.query(Department).filter(Department.deptID == dept_id).first()
    if not dept: raise HTTPException(status_code=404, detail="Department not found")

    dept.isActive = False
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.DELETE, tableAffected="departmentTable",
        target=dept.department, # TARGET ADDED
        details=f"Deactivated department: {dept.department}", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Department Deactivated", "desc": f"Deactivated department: {dept.department}", "action": "DELETE", "timestamp": datetime.now().isoformat()})
    return {"message": "Department deactivated successfully."}

# ---------------------------------------------------------
# 9. SYSTEM HEALTH LOGS
# ---------------------------------------------------------
@router.get("/health-logs")
def get_system_health_logs(db: Session = Depends(get_db)):
    logs = db.query(SystemHealthLog).order_by(SystemHealthLog.timestamp.desc()).all()
    formatted_logs = []
    for log in logs:
        formatted_logs.append({
            "id": log.logID, "date": log.timestamp.strftime("%m/%d/%Y"), "time": log.timestamp.strftime("%I:%M:%S %p"),
            "type": log.issueType, "module": log.module, "priority": log.priority.upper(), "description": log.description, "actions": log.recommendedAction
        })
    return formatted_logs

# ---------------------------------------------------------
# 10. REAL-TIME HARDWARE METRICS
# ---------------------------------------------------------
@router.get("/system-metrics")
def get_live_hardware_metrics(db: Session = Depends(get_db)):
    start_time = time.time()
    db.execute(text("SELECT 1")) 
    latency_ms = int((time.time() - start_time) * 1000)

    disk = psutil.disk_usage('/')
    disk_used_gb = round(disk.used / (1024**3), 1)
    disk_total_gb = round(disk.total / (1024**3), 1)

    cpu_usage = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory()
    
    server_status = "NORMAL"
    if cpu_usage > 90 or ram.percent > 95: server_status = "STRESSED"
    if latency_ms > 1000: server_status = "DOWNED"

    return {"latency": latency_ms, "disk_percent": disk.percent, "disk_used_gb": disk_used_gb, "disk_total_gb": disk_total_gb, "server_status": server_status, "cpu_percent": cpu_usage, "ram_percent": ram.percent}

# ---------------------------------------------------------
# 11. DASHBOARD SUMMARY
# ---------------------------------------------------------
@router.get("/dashboard/summary")
def get_dashboard_summary(period: str = Query("month", description="Filter period: day, week, month, year"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "Admin": raise HTTPException(status_code=403, detail="Unauthorized")
    
    ph_tz = ZoneInfo("Asia/Manila")
    today = datetime.now(ph_tz)
    timeline_data = []
    
    if period == "day":
        start_date = today.date()
        daily_appts = db.query(Appointment).filter(Appointment.assignedDate == start_date).all()
        am_count = 0
        pm_count = 0
        for a in daily_appts:
            if getattr(a, 'assignedSchedule', None) and getattr(a.assignedSchedule, 'startTime', None):
                if a.assignedSchedule.startTime.hour < 12:
                    am_count += 1
                else:
                    pm_count += 1
            else:
                pm_count += 1 
                
        timeline_data = [
            {"name": "6 AM", "appointments": 0},
            {"name": "Morning", "appointments": am_count},
            {"name": "Afternoon", "appointments": pm_count},
            {"name": "6 PM", "appointments": 0}
        ]

    elif period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        daily_counts = db.query(func.dayname(Appointment.assignedDate).label('day_name'), func.count(Appointment.appointmentID).label('count')).filter(Appointment.assignedDate >= start_date.date(), Appointment.assignedDate <= end_date.date()).group_by(func.dayname(Appointment.assignedDate)).all()
        count_dict = {row.day_name: row.count for row in daily_counts}
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            timeline_data.append({"name": day[:3], "appointments": count_dict.get(day, 0)})

    elif period == "year":
        start_date = datetime(today.year, 1, 1)
        end_date = datetime(today.year, 12, 31)
        monthly_counts = db.query(extract('month', Appointment.assignedDate).label('month_num'), func.count(Appointment.appointmentID).label('count')).filter(Appointment.assignedDate >= start_date.date(), Appointment.assignedDate <= end_date.date()).group_by(extract('month', Appointment.assignedDate)).all()
        count_dict = {int(row.month_num): row.count for row in monthly_counts}
        for month in range(1, 13):
            timeline_data.append({"name": calendar.month_abbr[month], "appointments": count_dict.get(month, 0)})
    else: 
        start_date = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = today.replace(day=last_day)
        daily_counts = db.query(Appointment.assignedDate, func.count(Appointment.appointmentID).label('count')).filter(Appointment.assignedDate >= start_date.date(), Appointment.assignedDate <= end_date.date()).group_by(Appointment.assignedDate).all()
        week_buckets = {"Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0}
        for row in daily_counts:
            if row.assignedDate:
                day_num = row.assignedDate.day
                if day_num <= 7: week_buckets["Week 1"] += row.count
                elif day_num <= 14: week_buckets["Week 2"] += row.count
                elif day_num <= 21: week_buckets["Week 3"] += row.count
                else: week_buckets["Week 4"] += row.count
        for week, count in week_buckets.items():
            timeline_data.append({"name": week, "appointments": count})

    total_appts = sum(item["appointments"] for item in timeline_data)
    used_slots_today = db.query(func.count(Appointment.appointmentID)).filter(Appointment.assignedDate == today.date()).scalar() or 0
    today_name = today.strftime('%A')
    active_doctors = db.query(Doctor).filter(Doctor.isAvailable == True).all()

    total_slots_today = 0
    for doctor in active_doctors:
        doctor_schedules = db.query(Schedule).filter(Schedule.docID == doctor.docID).all()
        for sched in doctor_schedules:
            sched_day = sched.weekDay.value if hasattr(sched.weekDay, 'value') else str(sched.weekDay)
            if sched_day.strip().lower() == today_name.lower(): total_slots_today += int(getattr(sched, 'maxPatients', 20) or 20) 

    total_staff = db.query(func.count(User.userID)).filter(User.role.in_([roleEnum.Staff, roleEnum.Admin])).scalar() or 0
    total_doctors = db.query(func.count(Doctor.docID)).scalar() or 0
    total_personnel = total_staff + total_doctors

    recent_logs = db.query(SystemLogs, User).join(User, SystemLogs.userID == User.userID).order_by(SystemLogs.timestamp.desc()).limit(6).all()
    formatted_audits = []
    for log, user in recent_logs:
        action_str = log.actionType.name if hasattr(log.actionType, 'name') else str(log.actionType)
        formatted_audits.append({"id": log.logID, "action": action_str, "details": f"[{user.role.value}] {log.details}", "date": log.timestamp.strftime("%Y-%m-%d"), "time": log.timestamp.strftime("%I:%M %p")})

    health_records = db.query(SystemHealthLog).order_by(SystemHealthLog.timestamp.desc()).limit(4).all()
    formatted_health = [{"id": log.logID, "type": log.issueType, "priority": log.priority, "time": log.timestamp.strftime("%Y-%m-%d %I:%M %p")} for log in health_records]
    dynamic_health_score = max(0, 100 - (len(formatted_health) * 5))

    return {"appointments": total_appts, 
            "used_slots": used_slots_today, 
            "total_slots": total_slots_today, 
            "health_score": dynamic_health_score, 
            "personnel": total_personnel, 
            "timeline_data": timeline_data, 
            "recent_audits": formatted_audits, 
            "recent_health": formatted_health}

# ---------------------------------------------------------
# 12. APPOINTMENTS MANAGEMENT
# ---------------------------------------------------------
@router.get("/appointments")
def get_all_appointments(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    appointments = db.query(Appointment).options(
        joinedload(Appointment.patient), joinedload(Appointment.doctor), joinedload(Appointment.department),
        joinedload(Appointment.status), joinedload(Appointment.assignedSchedule), joinedload(Appointment.action_by_user).joinedload(User.staff_profile) 
    ).order_by(Appointment.createdAt.desc()).all()

    formatted_appts = []
    for a in appointments:
        time_str = "TBD"
        if a.assignedSchedule and a.assignedSchedule.startTime and a.assignedSchedule.endTime:
            time_str = f"{a.assignedSchedule.startTime.strftime('%I:%M %p').lstrip('0')} - {a.assignedSchedule.endTime.strftime('%I:%M %p').lstrip('0')}"

        status_name = a.status.statusName if a.status else "Pending"
        action_name = "--"
        if a.action_by_user:
            action_name = f"{a.action_by_user.staff_profile.firstname} {a.action_by_user.staff_profile.surname} (Staff)" if a.action_by_user.staff_profile else "System Administrator"

        target_date = a.assignedDate if a.assignedDate else a.preferredStartDate
        formatted_appts.append({
            "raw_id": a.appointmentID, "id": f"APPT-{a.appointmentID:06d}",
            "hospitalNum": a.patient.hospital_num if a.patient and a.patient.hospital_num else "Unregistered",
            "patient": f"{a.patient.firstname} {a.patient.surname}" if a.patient else "Unknown",
            "dept": a.department.department if a.department else "N/A",
            "isSpecialty": (a.department.type == "Specialty") if a.department else False,
            "doctor": f"Dr. {a.doctor.firstname} {a.doctor.surname}" if a.doctor else "Unassigned",
            "status": status_name, "date": target_date.strftime("%B %d, %Y") if target_date else "TBD",
            "rawDate": target_date.isoformat() if target_date else None, "time": time_str,
            "cancelReason": a.actionReason if status_name in ["Cancelled", "Denied"] else None,
            "approvedBy": action_name if status_name != "Pending" else "--",
            "approvedDate": a.actionDate.strftime("%B %d, %Y - %I:%M %p") if a.actionDate else "--",
            "lastUpdate": a.createdAt.strftime("%B %d, %Y - %I:%M %p") if a.createdAt else "--"
        })
    return formatted_appts

@router.put("/appointments/{appt_id}/action")
def update_appointment_status(appt_id: int, data: AppointmentAction, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    appt = db.query(Appointment).filter(Appointment.appointmentID == appt_id).first()
    if not appt: raise HTTPException(status_code=404, detail="Appointment not found")
        
    target_status = db.query(AppointmentStatus).filter(AppointmentStatus.statusName == data.status).first()
    if not target_status: raise HTTPException(status_code=400, detail=f"Status '{data.status}' is invalid.")

    appt.statusID = target_status.statusID
    appt.actionBy_userID = current_user.userID
    appt.actionReason = data.reason
    appt.actionDate = datetime.now()

    action_enum = actionTypeEnum.APPROVE if data.status == "Approved" else actionTypeEnum.UPDATE
    if data.status == "Cancelled": action_enum = actionTypeEnum.DENY

    db.add(SystemLogs(
        userID=current_user.userID, actionType=action_enum, tableAffected="appointmentTable",
        target=f"Appointment #{appt.appointmentID}", # TARGET ADDED
        details=f"Marked Appointment #{appt.appointmentID} as {data.status}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({"title": "Appointment Status Updated", "desc": f"Updated status for appointment #{appt.appointmentID} to {data.status}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": f"Appointment successfully marked as {data.status}!"}

# ---------------------------------------------------------
# 13. UNIFIED NOTIFICATIONS FEED
# ---------------------------------------------------------
@router.get("/notifications")
def get_admin_notifications(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    recent_audits = db.query(SystemLogs).order_by(SystemLogs.timestamp.desc()).limit(20).all()
    recent_health = db.query(SystemHealthLog).order_by(SystemHealthLog.timestamp.desc()).limit(20).all()
    
    notifications = []
    for a in recent_audits:
        action = a.actionType.value
        title = "System Activity"
        if action in ["INSERT", "BOOK"]: title = "New Record Created"
        elif action in ["DELETE", "DENY"]: title = "Record Removed"
        elif action == "UPDATE": title = "Record Updated"
        elif action == "APPROVE": title = "Appointment Approved"
            
        notifications.append({
            "id": f"audit_{a.logID}", "raw_date": a.timestamp.isoformat(), 
            "title": title, "desc": a.details, "type": "audit", "action": action
        })

    for h in recent_health:
        notifications.append({
            "id": f"health_{h.logID}", "raw_date": h.timestamp.isoformat(),
            "title": f"System Alert: {h.module}", "desc": h.description, "type": "alert", "priority": h.priority
        })
    notifications.sort(key=lambda x: x["raw_date"], reverse=True)
    return notifications[:30]

@router.get("/notifications/stream")
async def stream_notifications(request: Request, token: str = Query(...), db: Session = Depends(get_db)):
    user = verify_token(token, db)
    if not user: raise HTTPException(status_code=401, detail="Invalid token")

    async def event_generator():
        yield "data: {\"type\": \"connected\"}\n\n"
        async for message in notifier.listen():
            if await request.is_disconnected(): break
            yield f"data: {message}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------------------------------------------------------
# 14. ACCOUNT PROFILE MANAGEMENT
# ---------------------------------------------------------
@router.get("/profile/me")
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prof = current_user.staff_profile
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    address_parts = (prof.address or "").split(" | ")
    street = address_parts[0] if len(address_parts) > 0 else ""
    barangay = address_parts[1] if len(address_parts) > 1 else ""
    city = address_parts[2] if len(address_parts) > 2 else ""
    province = address_parts[3] if len(address_parts) > 3 else ""
    postalCode = address_parts[4] if len(address_parts) > 4 else ""
    
    return {
        "firstname": prof.firstname,
        "middlename": prof.middlename,
        "surname": prof.surname,
        "suffix": prof.suffix,
        "contactNumber": prof.contactNumber,
        "dob": prof.dob.strftime("%Y-%m-%d") if getattr(prof, 'dob', None) else "",
        "gender": prof.gender,
        "email": current_user.email,
        "role": current_user.role.value,
        "street": street,
        "barangay": barangay,
        "city": city,
        "province": province,
        "postalCode": postalCode,
        "profilePhoto": getattr(prof, 'profilePhoto', None)
    }

@router.put("/update-profile")
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prof = current_user.staff_profile
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    prof.firstname = payload.firstname
    prof.middlename = payload.middlename
    prof.surname = payload.surname
    prof.suffix = payload.suffix
    prof.contactNumber = payload.contactNumber
    prof.gender = payload.gender
    
    if payload.dob:
        try:
            prof.dob = datetime.strptime(payload.dob, "%Y-%m-%d").date()
        except ValueError:
            pass 
        
    prof.address = f"{payload.street} | {payload.barangay} | {payload.city} | {payload.province} | {payload.postalCode}"
    
    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/upload-photo")
def upload_profile_photo(request: Request, profile_photo: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prof = current_user.staff_profile
    if isinstance(prof, list): prof = prof[0] if len(prof) > 0 else None
    if not prof:
        prof = Staff(userID=current_user.userID, firstname="System", surname="Admin")
        db.add(prof)

    result = cloudinary.uploader.upload(profile_photo.file, folder="gabay_profiles/")
    photo_url = result.get("secure_url")
    if hasattr(prof, 'profilePhoto'): prof.profilePhoto = photo_url
    
    db.commit()
    return {"photo_url": photo_url}

# ---------------------------------------------------------
# 15. SECURE CREDENTIAL UPDATES
# ---------------------------------------------------------
@router.put("/change-email")
def change_account_email(data: EmailChangeRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    existing_user = db.query(User).filter(User.email == data.new_email).first()
    if existing_user: raise HTTPException(status_code=400, detail="This email is already connected to another account.")

    current_user.email = data.new_email
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="userTable", 
        target="Personal Account", # TARGET ADDED
        details="Personnel updated their login email", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Email Updated", "desc": f"Updated email for user {current_user.userID}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": "Email updated successfully!", "new_email": data.new_email}

@router.put("/change-password")
def change_account_password(data: PasswordChangeRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    current_user.passwordHash = pwd_context.hash(data.new_password)
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="userTable", 
        target="Personal Account", # TARGET ADDED
        details="Personnel updated their login password", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Password Updated", "desc": f"Updated password for user {current_user.userID}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": "Password updated successfully!"}

# ---------------------------------------------------------
# 16. SYSTEM SETTINGS MANAGEMENT
# ---------------------------------------------------------
@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "Admin": raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")

    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/settings")
def update_system_settings(
    updated_data: dict, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user
    )):
    
    if current_user.role.value != "Admin": 
        raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")

    settings = db.query(SystemSettings).first()
    if not settings: 
        raise HTTPException(status_code=404, detail="Settings not found")

    for key, value in updated_data.items():
        if hasattr(settings, key): setattr(settings, key, value)

    db.commit()
    background_tasks.add_task(execute_log_retention_cleanup)
    return {"message": "System settings completely updated!"}
    
@router.post("/backup")
def trigger_manual_backup(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "Admin": raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")
        
    result = perform_database_backup()
    if not result["success"]:
        print(f"🚨 BACKUP FAILED: {result.get('error')}")
        raise HTTPException(status_code=500, detail=f"Backup Failed: {result.get('error')}")

    try:
        db.add(SystemLogs(
            userID=current_user.userID, tableAffected="Entire Database", actionType=actionTypeEnum.UPDATE, 
            target="Database Backup", # TARGET ADDED
            details=f"Manual system backup successfully generated. File: {result['filename']}"
        ))
        db.commit()
    except Exception as e: print(f"⚠️ BACKUP SUCCEEDED, BUT LOGGING FAILED: {e}")

    print(f"✅ BACKUP SUCCESS: Saved to {result['filepath']}")
    return {"message": "Backup sequence completed successfully!", "filename": result["filename"]}

@router.post("/restore")
async def restore_database(
    request: Request,
    backup_file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    if current_admin.role.value != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    if not backup_file.filename.endswith('.sql'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .sql file.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".sql") as temp_file:
        content = await backup_file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        db_user = os.getenv("DB_USER", "root")
        db_pass = os.getenv("DB_PASSWORD", "your_password")
        db_name = os.getenv("DB_NAME", "gabay_db")
        db_host = os.getenv("DB_HOST", "localhost")

        if db_pass:
            cmd = f"mysql -h {db_host} -u {db_user} -p'{db_pass}' {db_name} < {temp_file_path}"
        else:
            cmd = f"mysql -h {db_host} -u {db_user} {db_name} < {temp_file_path}"

        process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            raise Exception(f"MySQL Restore Error: {stderr.decode()}")

        db.add(SystemLogs(
            userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="Entire Database", 
            target="System Recovery", details=f"Admin restored database using file: {backup_file.filename}",
            ipAddress=request.client.host
        ))
        db.commit()

        return {"message": "System database successfully restored!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

def execute_log_retention_cleanup():
    db = SessionLocal() 
    try:
        settings = db.query(SystemSettings).first()
        if not settings or not settings.retentionValue:
            return

        value = int(settings.retentionValue)
        unit = settings.retentionUnit.lower()
        now = datetime.now()

        if unit == "days":
            cutoff_date = now - timedelta(days=value)
        elif unit == "months":
            cutoff_date = now - relativedelta(months=value)
        elif unit == "years":
            cutoff_date = now - relativedelta(years=value)
        else:
            return

        deleted_audits = db.query(SystemLogs).filter(SystemLogs.timestamp < cutoff_date).delete()
        deleted_health = db.query(SystemHealthLog).filter(SystemHealthLog.timestamp < cutoff_date).delete()
        
        db.commit()
        print(f"✅ Log Retention Executed: Cleared {deleted_audits} Audit Logs and {deleted_health} Health Logs older than {cutoff_date.date()}")
    
    except Exception as e:
        db.rollback()
        print(f"❌ Log Retention Error: {e}")
    finally:
        db.close()

# ---------------------------------------------------------
# 17. ADMIN CALENDAR
# ---------------------------------------------------------
@router.get("/calendar")
def get_admin_calendar_data(month: str, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    try:
        target_year, target_month = map(int, month.split('-'))

        events_in_month = db.query(CalendarEvent).filter(
            extract('year', CalendarEvent.date) == target_year, 
            extract('month', CalendarEvent.date) == target_month
        ).all()
        
        formatted_events = [{"id": e.eventID, "title": e.title, "description": e.description, "date": e.date.strftime("%Y-%m-%d"), "type": (e.type.value if hasattr(e.type, 'value') else str(e.type)).upper()} for e in events_in_month]

        appointments = db.query(Appointment.assignedDate, AppointmentStatus.statusName, func.count(Appointment.appointmentID).label('count'))\
            .join(AppointmentStatus, Appointment.statusID == AppointmentStatus.statusID)\
            .filter(extract('year', Appointment.assignedDate) == target_year, extract('month', Appointment.assignedDate) == target_month, Appointment.assignedDate != None)\
            .group_by(Appointment.assignedDate, AppointmentStatus.statusName).all()

        daily_stats = {}
        for appt_date, status_name, count in appointments:
            date_str = appt_date.strftime("%Y-%m-%d")
            s_name = status_name.lower()
            
            if date_str not in daily_stats: 
                daily_stats[date_str] = {"date": date_str, "confirmed": 0, "canceled": 0, "noShow": 0, "completed": 0}
            
            # Match the text of the status to securely route the stats
            if "approve" in s_name or "reschedule" in s_name or "book" in s_name:
                daily_stats[date_str]["confirmed"] += count
            elif "cancel" in s_name or "deny" in s_name:
                daily_stats[date_str]["canceled"] += count
            elif "no show" in s_name:
                daily_stats[date_str]["noShow"] += count
            elif "complete" in s_name:
                daily_stats[date_str]["completed"] += count
        
        active_doctors = db.query(Doctor).filter(Doctor.isAvailable == True).all()
        capacity_map = {"Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0}
        
        for doctor in active_doctors:
            doctor_schedules = db.query(Schedule).filter(Schedule.docID == doctor.docID).all()
            for sched in doctor_schedules:
                sched_day = sched.weekDay.value if hasattr(sched.weekDay, 'value') else str(sched.weekDay)
                safe_day = sched_day.strip().capitalize()
                if safe_day in capacity_map: capacity_map[safe_day] += int(getattr(sched, 'maxPatients', 20) or 20)

        return {"appointments": list(daily_stats.values()), "events": formatted_events, "capacity_map": capacity_map}
    except Exception as e:
        print(f"Calendar Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch calendar data")
@router.post("/calendar/events")
def create_calendar_event(data: CalendarEventCreate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    try:
        parsed_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        safe_type = data.type.upper() 

        new_event = CalendarEvent(title=data.title, description=data.description, date=parsed_date, type=safe_type)
        db.add(new_event)

        db.add(SystemLogs(
            userID=current_admin.userID, actionType=actionTypeEnum.INSERT, tableAffected="calendarEventTable",
            target=data.title, # TARGET ADDED
            details=f"Added new calendar {data.type.lower()}: {data.title}", ipAddress=request.client.host
        ))
        db.commit()

        notifier.broadcast_sync({"title": "New Calendar Event Added", "desc": f"Created calendar event: {data.title}", "action": "INSERT", "timestamp": datetime.now().isoformat()})
        return {"message": f"{safe_type} created successfully"}
    except ValueError: raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")
    except Exception as e:
        db.rollback()
        print(f"Event Creation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create event")
    
# ---------------------------------------------------------
# 18. PATIENT MANAGEMENT
# ---------------------------------------------------------
@router.get("/patients")
def get_all_patients(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    patients = db.query(Patient).options(joinedload(Patient.user_account)).all()
    results = []
    for p in patients:
        status_val = "Active"
        join_date = None
        email_val = "N/A"
        
        if p.user_account:
            status_val = "Active" if p.user_account.isActive else "Deactivated"
            join_date = p.user_account.createdDate
            email_val = p.user_account.email
            
        results.append({
            "patient_id": p.patientID, "raw_id": p.user_account.userID if p.user_account else None,
            "id": p.hospital_num or "Unregistered", "name": f"{p.firstname} {p.surname}",
            "email": email_val, "phone": p.contactNumber or "N/A", "gender": p.gender or "N/A",
            "status": status_val, "joinDate": join_date.isoformat() if join_date else None
        })
    return results

@router.put("/patients/{user_id}/status")
def toggle_patient_status(user_id: int, data: PatientStatusUpdate, request: Request, db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user or user.role != roleEnum.Patient: raise HTTPException(status_code=404, detail="Patient account not found.")

    is_activating = (data.status == "Active")
    user.isActive = is_activating
    
    target_name = f"{user.patient_profile.firstname} {user.patient_profile.surname}" if user.patient_profile else "Unknown Patient"
    action = actionTypeEnum.UPDATE if is_activating else actionTypeEnum.DELETE
    
    db.add(SystemLogs(
        userID=current_admin.userID, actionType=action, tableAffected="userTable",
        target=target_name, # TARGET ADDED
        details=f"{'Reactivated' if is_activating else 'Deactivated'} patient account for: {target_name}", ipAddress=request.client.host
    ))
    db.commit()
    notifier.broadcast_sync({"title": "Patient Status Updated", "desc": f"Updated status for patient {target_name} to {data.status}", "action": "UPDATE", "timestamp": datetime.now().isoformat()})
    return {"message": f"Patient status successfully updated to {data.status}"}

# ---------------------------------------------------------
# 19. ANALYTICS & REPORTING
# ---------------------------------------------------------
@router.get("/analytics")
def get_analytics_data(
    period: str = Query("thisMonth", description="Filter period: thisDay, thisWeek, thisMonth, thisYear"), 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    ph_tz = ZoneInfo("Asia/Manila")
    now = datetime.now(ph_tz)
    
    if period == "thisDay":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == "thisWeek":
        start_date = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
    elif period == "thisYear":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    else:
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        _, last_day = calendar.monthrange(now.year, now.month)
        end_date = now.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)

    appts_query = db.query(Appointment).filter(Appointment.createdAt >= start_date, Appointment.createdAt <= end_date)
    logs_query = db.query(SystemLogs).filter(SystemLogs.timestamp >= start_date, SystemLogs.timestamp <= end_date)

    # SUMMARY METRICS
    top_doc_row = db.query(Appointment.docID, func.count(Appointment.appointmentID).label('count'))\
        .filter(Appointment.createdAt >= start_date, Appointment.createdAt <= end_date, Appointment.docID != None)\
        .group_by(Appointment.docID).order_by(desc('count')).first()
    top_doc_name = "None"
    if top_doc_row:
        doc = db.query(Doctor).filter(Doctor.docID == top_doc_row.docID).first()
        top_doc_name = f"Dr. {doc.firstname} {doc.surname}" if doc else "Unknown"

    # Top Department
    top_dept_row = db.query(Appointment.deptID, func.count(Appointment.appointmentID).label('count'))\
        .filter(Appointment.createdAt >= start_date, Appointment.createdAt <= end_date)\
        .group_by(Appointment.deptID).order_by(desc('count')).first()
    top_dept_name = "None"
    if top_dept_row:
        dept = db.query(Department).filter(Department.deptID == top_dept_row.deptID).first()
        top_dept_name = dept.department if dept else "Unknown"

    # Most Active Staff
    active_staff_row = db.query(SystemLogs.userID, func.count(SystemLogs.logID).label('count'))\
        .filter(SystemLogs.timestamp >= start_date, SystemLogs.timestamp <= end_date)\
        .group_by(SystemLogs.userID).order_by(desc('count')).first()
    active_staff_name = "None"
    if active_staff_row:
        staff_user = db.query(User).filter(User.userID == active_staff_row.userID).first()
        if staff_user and staff_user.staff_profile:
            active_staff_name = f"{staff_user.staff_profile.firstname} {staff_user.staff_profile.surname}"

    summary = {
        "topDoc": top_doc_name,
        "topDept": top_dept_name,
        "activeStaff": active_staff_name,
        "docAppts": appts_query.filter(Appointment.docID != None).count(),
        "deptReservations": appts_query.count(),
        "staffActions": logs_query.count()
    }

    # GRAPH DATA (Timeline Grouping)
    graph_data = []
    if period == "thisDay":
        am_appts = appts_query.join(Department).filter(extract('hour', Appointment.createdAt) < 12).all()
        pm_appts = appts_query.join(Department).filter(extract('hour', Appointment.createdAt) >= 12).all()
        
        graph_data.append({"name": "Morning (AM)", "General": sum(1 for a in am_appts if a.department.type == 'General'), "Specialty": sum(1 for a in am_appts if a.department.type == 'Specialty')})
        graph_data.append({"name": "Afternoon (PM)", "General": sum(1 for a in pm_appts if a.department.type == 'General'), "Specialty": sum(1 for a in pm_appts if a.department.type == 'Specialty')})
    
    elif period == "thisWeek":
        daily_counts = db.query(
            func.dayname(Appointment.createdAt).label('day'),
            Department.type,
            func.count(Appointment.appointmentID).label('count')
        ).join(Department).filter(Appointment.createdAt >= start_date, Appointment.createdAt <= end_date)\
        .group_by(func.dayname(Appointment.createdAt), Department.type).all()
        
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for day in days:
            gen_count = next((r.count for r in daily_counts if r.day == day and r.type == 'General'), 0)
            spec_count = next((r.count for r in daily_counts if r.day == day and r.type == 'Specialty'), 0)
            graph_data.append({"name": day[:3], "General": gen_count, "Specialty": spec_count})

    elif period == "thisYear":
        monthly_counts = db.query(
            extract('month', Appointment.createdAt).label('month'),
            Department.type,
            func.count(Appointment.appointmentID).label('count')
        ).join(Department).filter(Appointment.createdAt >= start_date, Appointment.createdAt <= end_date)\
        .group_by(extract('month', Appointment.createdAt), Department.type).all()
        
        for month in range(1, 13):
            gen_count = next((r.count for r in monthly_counts if r.month == month and r.type == 'General'), 0)
            spec_count = next((r.count for r in monthly_counts if r.month == month and r.type == 'Specialty'), 0)
            graph_data.append({"name": calendar.month_abbr[month], "General": gen_count, "Specialty": spec_count})

    else: 
        week_buckets = {
            "Week 1": {"General": 0, "Specialty": 0}, "Week 2": {"General": 0, "Specialty": 0},
            "Week 3": {"General": 0, "Specialty": 0}, "Week 4": {"General": 0, "Specialty": 0}
        }
        month_appts = appts_query.join(Department).all()
        for a in month_appts:
            target_date = a.createdAt or a.assignedDate or now
            day = target_date.day
            
            w_key = "Week 1" if day <= 7 else "Week 2" if day <= 14 else "Week 3" if day <= 21 else "Week 4"
            
            raw_type = getattr(a.department, 'type', 'General') or 'General'
            safe_type = "Specialty" if "specialty" in str(raw_type).lower() else "General"
            
            week_buckets[w_key][safe_type] += 1
        
        for w, counts in week_buckets.items():
            graph_data.append({"name": w, "General": counts["General"], "Specialty": counts["Specialty"]})


    # DEPARTMENT STATS
    dept_stats = []
    departments = db.query(Department).all()
    for d in departments:
        dept_appts = appts_query.filter(Appointment.deptID == d.deptID)
        total = dept_appts.count()
        if total > 0:
            completed = dept_appts.join(AppointmentStatus).filter(
                AppointmentStatus.statusName.ilike("%Complete%")
            ).count()
            
            canceled = dept_appts.join(AppointmentStatus).filter(
                or_(
                    AppointmentStatus.statusName.ilike("%Cancel%"),
                    AppointmentStatus.statusName.ilike("%Deny%")
                )
            ).count()
            
            dept_stats.append({
                "name": d.department,
                "reservations": total,
                "completed": completed,
                "canceled": canceled
            })
    dept_stats.sort(key=lambda x: x["reservations"], reverse=True)

    # STAFF PERFORMANCE 
    staff_users = db.query(User).options(joinedload(User.staff_profile)).filter(User.role == roleEnum.Staff).all()

    log_counts = db.query(
        SystemLogs.userID,
        SystemLogs.actionType,
        func.count(SystemLogs.logID).label('total_count')
    ).filter(
        SystemLogs.actionType.in_([
            actionTypeEnum.APPROVE, 
            actionTypeEnum.DENY, 
            actionTypeEnum.UPDATE, 
            actionTypeEnum.RESCHEDULE
        ])
    ).group_by(SystemLogs.userID, SystemLogs.actionType).all()

    performance_dict = {}
    for user_id, action, count in log_counts:
        if user_id not in performance_dict:
            performance_dict[user_id] = {"approved": 0, "canceled": 0, "rescheduled": 0}
            
        if action == actionTypeEnum.APPROVE:
            performance_dict[user_id]["approved"] = count
        elif action == actionTypeEnum.DENY:
            performance_dict[user_id]["canceled"] = count
        elif action in [actionTypeEnum.UPDATE, actionTypeEnum.RESCHEDULE]:
            performance_dict[user_id]["rescheduled"] += count

    staff_performance = []
    for s in staff_users:
        if s.staff_profile:
            stats = performance_dict.get(s.userID, {"approved": 0, "canceled": 0, "rescheduled": 0})
            staff_performance.append({
                "id": s.userID,
                "name": f"{s.staff_profile.firstname} {s.staff_profile.surname}",
                "role": s.staff_profile.position,
                "approved": stats["approved"],
                "canceled": stats["canceled"],
                "rescheduled": stats["rescheduled"],
                "isOnline": s.isActive
            })
    staff_performance.sort(key=lambda x: x["approved"] + x["rescheduled"], reverse=True)

    return {
        "summary": summary,
        "graphData": graph_data,
        "departmentStats": dept_stats,
        "staffPerformance": staff_performance
    }

