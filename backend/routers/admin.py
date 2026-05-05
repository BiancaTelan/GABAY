from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, File, UploadFile, Query
from sqlalchemy.orm import Session, joinedload
from db_connection import get_db
from db_model import Appointment, SystemSettings, User, roleEnum, Staff, SystemLogs, actionTypeEnum, Department, Doctor, Schedule, weekDayEnum, SystemHealthLog, AppointmentStatus, CalendarEvent
from security import get_password_hash, get_current_user
from typing import Optional
from pydantic import BaseModel, EmailStr
from email_utils import send_personnel_credentials_email
from datetime import datetime, date, timedelta
from sqlalchemy import func, text, desc, extract
from passlib.context import CryptContext
from .backup_utils import perform_database_backup
from zoneinfo import ZoneInfo
import calendar
import random
import time
import psutil
import shutil
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------
def create_system_log(db: Session, user_id: int, action: actionTypeEnum, table: str, details: str, request: Request):
   
    new_log = SystemLogs(
        userID=user_id,
        actionType=action,
        tableAffected=table,
        details=details,
        ipAddress=request.client.host 
    )
    db.add(new_log)
    db.commit()

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class PersonnelCreate(BaseModel):
    firstname: str
    surname: str
    email: EmailStr
    role: str 
    position: str
    gender: Optional[str] = None
    contactNumber: Optional[str] = None

class PersonnelUpdate(BaseModel):
    firstname: str
    surname: str
    role: str 
    position: str
    gender: Optional[str] = None
    contactNumber: Optional[str] = None
    status: str # 

class PersonnelPageUpdate(BaseModel):
    role: str
    deptID: Optional[int] = None
    workingDays: Optional[str] = None
    workingHours: Optional[str] = None
    firstname: Optional[str] = None 
    surname: Optional[str] = None

class DoctorCreate(BaseModel):
    firstname: str
    surname: str
    deptID: int
    workingDays: str  
    workingHours: str 

class DepartmentCreateUpdate(BaseModel):
    department: str
    type: str
    slotCapacity: int

class AppointmentAction(BaseModel):
    status: str 
    reason: Optional[str] = None

class ProfileUpdate(BaseModel):
    firstname: str
    surname: str
    mi: Optional[str] = ""
    suffix: Optional[str] = ""
    contactNumber: str
    dob: str
    gender: str
    address: Optional[str] = ""

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
            "raw_id": u.userID, 
            "id": display_id,
            "name": full_name,
            "firstname": u.staff_profile.firstname if u.staff_profile else "System",
            "surname": u.staff_profile.surname if u.staff_profile else "Admin",
            "role": u.role.value,
            "position": u.staff_profile.position if u.staff_profile else "System Administrator",
            "email": u.email,
            "gender": u.staff_profile.gender if u.staff_profile and u.staff_profile.gender else "N/A",
            "phone": u.staff_profile.contactNumber if u.staff_profile and u.staff_profile.contactNumber else "N/A",
            "status": current_status,
            "joinDate": join_date
        })
        
    return formatted_users

# ---------------------------------------------------------
# 2. USER CREATION
# ---------------------------------------------------------
@router.post("/addusers")
def create_personnel(
    data: PersonnelCreate, 
    background_tasks: BackgroundTasks, 
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_user) 
):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    assigned_role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff

    raw_password = f"Gabay{random.randint(1000, 9999)}!" 
    hashed_password = get_password_hash(raw_password)
    
    new_user = User(
        email=data.email,
        passwordHash=hashed_password,
        role=assigned_role,
        isActive=True,
        is_verified=True 
    )
    db.add(new_user)
    db.flush() 

    new_staff = Staff(
        userID=new_user.userID,
        firstname=data.firstname,
        surname=data.surname,
        position=data.position,
        gender=data.gender,
        contactNumber=data.contactNumber
    )
    db.add(new_staff)
    
    # --- AUTOMATIC AUDIT LOGGING ---
    new_log = SystemLogs(
        userID=current_admin.userID,
        actionType=actionTypeEnum.INSERT,
        tableAffected="userTable",
        details=f"Created {data.role} account: {data.firstname} {data.surname}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()

    background_tasks.add_task(
        send_personnel_credentials_email,
        recipient_email=data.email,
        name=f"{data.firstname} {data.surname}",
        role=data.role,
        raw_password=raw_password
    )

    return {"message": f"{data.firstname}'s account was created successfully!"}
# ---------------------------------------------------------
# 3. USER UPDATING & DELETION
# ---------------------------------------------------------
@router.put("/users/{user_id}")
def update_personnel(
    user_id: int, 
    data: PersonnelUpdate, 
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update Logic
    user.role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff
    user.isActive = True if data.status == "Active" else False

    if user.staff_profile:
        user.staff_profile.firstname = data.firstname
        user.staff_profile.surname = data.surname
        user.staff_profile.position = data.position
        user.staff_profile.gender = data.gender
        user.staff_profile.contactNumber = data.contactNumber

    # --- AUDIT LOG ---
    new_log = SystemLogs(
        userID=current_admin.userID,
        actionType=actionTypeEnum.UPDATE,
        tableAffected="userTable/staffTable",
        details=f"Updated profile for: {data.firstname} {data.surname} (Status: {data.status})",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": "Account successfully updated and logged!"}

@router.delete("/users/{user_id}")
def deactivate_personnel(
    user_id: int, 
    request: Request, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.userID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Capture name for the log before we change anything
    target_name = "Unknown Staff"
    if user.staff_profile:
        target_name = f"{user.staff_profile.firstname} {user.staff_profile.surname}"

    user.isActive = False

    # --- AUDIT LOG ---
    new_log = SystemLogs(
        userID=current_admin.userID,
        actionType=actionTypeEnum.DELETE, 
        tableAffected="userTable",
        details=f"Deactivated account for: {target_name} (Email: {user.email})",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
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
            "user": user_name,
            "role": role_name,
            "action": log.actionType.value if log.actionType else "SYSTEM",
            "description": log.details or f"Modified {log.tableAffected}",
            "ip": log.ipAddress or "Localhost"
        })
        
    return formatted_logs

# ---------------------------------------------------------
# 5. PERSONNEL PAGE MANAGEMENT
# ---------------------------------------------------------
@router.get("/personnel")
def get_personnel_list(db: Session = Depends(get_db)):
    users = db.query(User).options(
        joinedload(User.staff_profile).joinedload(Staff.department)
    ).filter(User.role.in_([roleEnum.Admin, roleEnum.Staff])).all()
    
    formatted_personnel = []
    
    for u in users:
        name = "System Admin"
        display_id = f"ADM-{u.userID:04d}"
        dept_name = "N/A"
        dept_id = None
        is_specialty = False
        schedule = "Unassigned"
        time_slot = "Unassigned"

        if u.staff_profile:
            name = f"{u.staff_profile.firstname} {u.staff_profile.surname}"
            display_id = f"STF-{u.staff_profile.staffID:04d}"
            schedule = u.staff_profile.workingDays or "Unassigned"
            time_slot = u.staff_profile.workingHours or "Unassigned"
            
            if u.staff_profile.department:
                dept_name = u.staff_profile.department.department
                dept_id = u.staff_profile.deptID
                is_specialty = (u.staff_profile.department.type == "Specialty")

        current_status = "Active" if u.isActive else "Deactivated"

        formatted_personnel.append({
            "raw_id": u.userID,
            "id": display_id,
            "role": u.role.value.upper(),
            "name": name,
            "firstname": u.staff_profile.firstname if u.staff_profile else "System",
            "surname": u.staff_profile.surname if u.staff_profile else "Admin",      
            "dept": dept_name,
            "deptID": dept_id,
            "isSpecialty": is_specialty,
            "schedule": schedule,
            "time": time_slot,
            "status": current_status
        })

    # --- FETCH DOCTORS ---
    doctors = db.query(Doctor).options(
        joinedload(Doctor.department), 
        joinedload(Doctor.schedule)
    ).all()
    
    day_map_reverse = {
        "Monday": "M", "Tuesday": "T", "Wednesday": "W", 
        "Thursday": "TH", "Friday": "F", "Saturday": "S", "Sunday": "SU"
    }

    for d in doctors:
        schedule_str = "Unassigned"
        time_str = "Unassigned"
        
        if d.schedule:
            short_days = [day_map_reverse.get(s.weekDay.value, s.weekDay.value) for s in d.schedule]
            schedule_str = ", ".join(short_days)
            
            start = d.schedule[0].startTime.strftime("%I:%M %p").lstrip("0")
            end = d.schedule[0].endTime.strftime("%I:%M %p").lstrip("0")
            time_str = f"{start} - {end}"

        formatted_personnel.append({
            "raw_id": d.docID,
            "id": f"DOC-{d.docID:04d}",
            "role": "DOCTOR",
            "name": f"{d.firstname} {d.surname}",
            "firstname": d.firstname,
            "surname": d.surname,
            "dept": d.department.department if d.department else "N/A",
            "deptID": d.deptID,
            "isSpecialty": (d.department.type == "Specialty") if d.department else False,
            "schedule": schedule_str,
            "time": time_str,
            "status": "Active" if d.isAvailable else "Inactive"
        })
        
    return formatted_personnel

@router.put("/personnel/{person_id}")
def update_personnel_page(
    person_id: int, 
    data: PersonnelPageUpdate, 
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_user)
):
    target_name = ""

    # === IF DOCTOR ===
    if data.role == "DOCTOR":
        doc = db.query(Doctor).filter(Doctor.docID == person_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        doc.firstname = data.firstname
        doc.surname = data.surname
        doc.deptID = data.deptID
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
                        new_schedule = Schedule(docID=doc.docID, weekDay=day_map[day], startTime=start_time, endTime=end_time, maxPatients=20)
                        db.add(new_schedule)
            except Exception:
                pass 

    # === IF STAFF / ADMIN ===
    else:
        user = db.query(User).filter(User.userID == person_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Staff not found")

        user.role = roleEnum.Admin if data.role.lower() == "admin" else roleEnum.Staff
        if user.staff_profile:
            user.staff_profile.deptID = data.deptID
            user.staff_profile.workingDays = data.workingDays
            user.staff_profile.workingHours = data.workingHours
            target_name = f"{user.staff_profile.firstname} {user.staff_profile.surname}"
        else:
            target_name = "System Admin"

    new_log = SystemLogs(
        userID=current_admin.userID,
        actionType=actionTypeEnum.UPDATE,
        tableAffected="doctorTable" if data.role == "DOCTOR" else "staffTable",
        details=f"Updated assignment/profile for: {target_name}",
        ipAddress=request.client.host
    )
    db.add(new_log)

    db.commit()
    return {"message": "Personnel assignment updated successfully!"}

@router.post("/doctors")
def add_doctor(
    data: DoctorCreate, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    new_doc = Doctor(
        firstname=data.firstname,
        surname=data.surname,
        deptID=data.deptID,
        isAvailable=True
    )
    db.add(new_doc)
    db.flush()

    day_map = {
        "M": weekDayEnum.Monday, "T": weekDayEnum.Tuesday, "W": weekDayEnum.Wednesday,
        "TH": weekDayEnum.Thursday, "F": weekDayEnum.Friday, "S": weekDayEnum.Saturday, "SU": weekDayEnum.Sunday
    }
    
    if data.workingDays != "Unassigned" and data.workingHours != "Unassigned":
        try:
            time_parts = data.workingHours.split(" - ")
            start_time = datetime.strptime(time_parts[0], "%I:%M %p").time()
            end_time = datetime.strptime(time_parts[1], "%I:%M %p").time()
            
            selected_days = [d.strip() for d in data.workingDays.split(",")]
            for day in selected_days:
                if day in day_map:
                    new_schedule = Schedule(
                        docID=new_doc.docID,
                        weekDay=day_map[day],
                        startTime=start_time,
                        endTime=end_time,
                        maxPatients=25 
                    )
                    db.add(new_schedule)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid time format. Please use 'HH:MM AM - HH:MM PM'")

    new_log = SystemLogs(
        userID=current_admin.userID,
        actionType=actionTypeEnum.INSERT,
        tableAffected="doctorTable/scheduleTable",
        details=f"Added new doctor: {data.firstname} {data.surname}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": "Doctor added successfully!"}

# ---------------------------------------------------------
# 6. DEPARTMENT FETCHING
# ---------------------------------------------------------
@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Fetches all departments to populate frontend dropdown menus."""
    departments = db.query(Department).order_by(Department.department.asc()).all()
    
    return [
        {
            "deptID": d.deptID, 
            "department": d.department, 
            "type": d.type 
        } for d in departments
    ]

# ---------------------------------------------------------
# 7. DEPARTMENT MANAGEMENT
# ---------------------------------------------------------
@router.get("/departments/stats")
def get_department_stats(db: Session = Depends(get_db)):
    depts = db.query(Department).filter(Department.isActive == True).all()
    
    formatted_depts = []
    for d in depts:
        doc_count = db.query(Doctor).filter(Doctor.deptID == d.deptID).count()
        staff_count = db.query(Staff).filter(Staff.deptID == d.deptID).count()
        
        used_slots = db.query(Appointment).filter(
            Appointment.deptID == d.deptID,
            Appointment.preferredStartDate == date.today()
        ).count()

        prefix = "SPEC" if d.type.upper() == "SPECIALTY" else "GEN"

        formatted_depts.append({
            "raw_id": d.deptID,
            "id": f"{prefix}-{d.deptID:03d}",
            "name": d.department,
            "type": d.type.upper(),
            "doctors": doc_count,
            "staff": staff_count,
            "usedSlots": used_slots,
            "totalSlots": d.slotCapacity
        })
        
    return formatted_depts

@router.post("/departments")
def create_department(
    data: DepartmentCreateUpdate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    new_dept = Department(
        department=data.department,
        type=data.type.capitalize(),
        slotCapacity=data.slotCapacity,
        isActive=True
    )
    db.add(new_dept)
    
    new_log = SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.INSERT, tableAffected="departmentTable",
        details=f"Created new department: {data.department}", ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": "Department created successfully!"}

@router.put("/departments/{dept_id}")
def update_department(
    dept_id: int, 
    data: DepartmentCreateUpdate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.deptID == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    if dept.slotCapacity != data.slotCapacity:
        doctors_in_dept = db.query(Doctor).filter(Doctor.deptID == dept.deptID).all()
        for doc in doctors_in_dept:
            schedules = db.query(Schedule).filter(Schedule.docID == doc.docID).all()
            for sched in schedules:
                sched.maxPatients = data.slotCapacity

    dept.department = data.department
    dept.type = data.type.capitalize()
    dept.slotCapacity = data.slotCapacity

    new_log = SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.UPDATE, tableAffected="departmentTable/scheduleTable",
        details=f"Updated department: {data.department} (Capacity: {data.slotCapacity})", ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": "Department and schedules updated successfully!"}

@router.delete("/departments/{dept_id}")
def deactivate_department(
    dept_id: int, 
    request: Request,
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.deptID == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    dept.isActive = False

    new_log = SystemLogs(
        userID=current_admin.userID, actionType=actionTypeEnum.DELETE, tableAffected="departmentTable",
        details=f"Deactivated department: {dept.department}", ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": "Department deactivated successfully."}

# ---------------------------------------------------------
# 8. SYSTEM HEALTH LOGS
# ---------------------------------------------------------
@router.get("/health-logs")
def get_system_health_logs(db: Session = Depends(get_db)):
    # Fetch logs ordered by newest first
    logs = db.query(SystemHealthLog).order_by(SystemHealthLog.timestamp.desc()).all()
    
    formatted_logs = []
    for log in logs:
        formatted_logs.append({
            "id": log.logID,
            "date": log.timestamp.strftime("%m/%d/%Y"),
            "time": log.timestamp.strftime("%I:%M:%S %p"),
            "type": log.issueType,
            "module": log.module,
            "priority": log.priority.upper(),
            "description": log.description,
            "actions": log.recommendedAction
        })
        
    return formatted_logs

# ---------------------------------------------------------
# 9. REAL-TIME HARDWARE METRICS
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
    if cpu_usage > 90 or ram.percent > 95:
        server_status = "STRESSED"
    if latency_ms > 1000:
        server_status = "DOWNED"

    return {
        "latency": latency_ms,
        "disk_percent": disk.percent,
        "disk_used_gb": disk_used_gb,
        "disk_total_gb": disk_total_gb,
        "server_status": server_status,
        "cpu_percent": cpu_usage,
        "ram_percent": ram.percent
    }

# ---------------------------------------------------------
# 10. DASHBOARD SUMMARY
# ---------------------------------------------------------
@router.get("/dashboard/summary")
def get_dashboard_summary(
    period: str = Query("month", description="Filter period: week, month, year"),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    ph_tz = ZoneInfo("Asia/Manila")
    today = datetime.now(ph_tz)
    timeline_data = []
    
    if period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        daily_counts = db.query(
            func.dayname(Appointment.assignedDate).label('day_name'),
            func.count(Appointment.appointmentID).label('count')
        ).filter(
            Appointment.assignedDate >= start_date.date(),
            Appointment.assignedDate <= end_date.date()
        ).group_by(func.dayname(Appointment.assignedDate)).all()

        count_dict = {row.day_name: row.count for row in daily_counts}
        
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for day in days_of_week:
            timeline_data.append({
                "name": day[:3],
                "appointments": count_dict.get(day, 0)
            })

    elif period == "year":
        start_date = datetime(today.year, 1, 1)
        end_date = datetime(today.year, 12, 31)

        monthly_counts = db.query(
            extract('month', Appointment.assignedDate).label('month_num'),
            func.count(Appointment.appointmentID).label('count')
        ).filter(
            Appointment.assignedDate >= start_date.date(),
            Appointment.assignedDate <= end_date.date()
        ).group_by(extract('month', Appointment.assignedDate)).all()

        count_dict = {int(row.month_num): row.count for row in monthly_counts}

        for month in range(1, 13):
            month_name = calendar.month_abbr[month] 
            timeline_data.append({
                "name": month_name,
                "appointments": count_dict.get(month, 0)
            })

    else: 
        start_date = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = today.replace(day=last_day)

        daily_counts = db.query(
            Appointment.assignedDate,
            func.count(Appointment.appointmentID).label('count')
        ).filter(
            Appointment.assignedDate >= start_date.date(),
            Appointment.assignedDate <= end_date.date()
        ).group_by(Appointment.assignedDate).all()

        week_buckets = {"Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0}
        
        for row in daily_counts:
            day_num = row.assignedDate.day
            if day_num <= 7: week_buckets["Week 1"] += row.count
            elif day_num <= 14: week_buckets["Week 2"] += row.count
            elif day_num <= 21: week_buckets["Week 3"] += row.count
            else: week_buckets["Week 4"] += row.count # Days 22-31

        for week, count in week_buckets.items():
            timeline_data.append({
                "name": week,
                "appointments": count
            })

    total_appts = sum(item["appointments"] for item in timeline_data)

    used_slots_today = db.query(func.count(Appointment.appointmentID)).filter(
        Appointment.assignedDate == today.date()
    ).scalar() or 0
    
    today_name = today.strftime('%A')
    active_doctors = db.query(Doctor).filter(Doctor.isAvailable == True).all()

    total_slots_today = 0

    for doctor in active_doctors:
        doctor_schedules = db.query(Schedule).filter(Schedule.docID == doctor.docID).all()
        
        for sched in doctor_schedules:
            sched_day = sched.weekDay.value if hasattr(sched.weekDay, 'value') else str(sched.weekDay)
            
            if sched_day.strip().lower() == today_name.lower():
                total_slots_today += int(getattr(sched, 'maxPatients', 20) or 20) 

    total_staff = db.query(func.count(User.userID)).filter(
        User.role.in_([roleEnum.Staff, roleEnum.Admin]) 
    ).scalar() or 0
    total_doctors = db.query(func.count(Doctor.docID)).scalar() or 0
    total_personnel = total_staff + total_doctors

    recent_logs = db.query(SystemLogs, User).join(
        User, SystemLogs.userID == User.userID
    ).order_by(SystemLogs.timestamp.desc()).limit(6).all()

    formatted_audits = []
    for log, user in recent_logs:
        action_str = log.actionType.name if hasattr(log.actionType, 'name') else str(log.actionType)
        
        formatted_audits.append({
            "id": log.logID,
            "action": action_str,
            "details": f"[{user.role.value}] {log.details}",
            "date": log.timestamp.strftime("%Y-%m-%d"),
            "time": log.timestamp.strftime("%I:%M %p")
        })

    health_records = db.query(SystemHealthLog).order_by(SystemHealthLog.timestamp.desc()).limit(4).all()

    formatted_health = []
    for log in health_records:
        formatted_health.append({
            "id": log.logID,
            "type": log.issueType,
            "priority": log.priority,
            "time": log.timestamp.strftime("%Y-%m-%d %I:%M %p")
        })
    
    dynamic_health_score = max(0, 100 - (len(formatted_health) * 5))

    return {
        "appointments": total_appts,
        "used_slots": used_slots_today,
        "total_slots": total_slots_today,
        "health_score": dynamic_health_score, 
        "personnel": total_personnel,    
        "timeline_data": timeline_data,
        "recent_audits": formatted_audits, 
        "recent_health": formatted_health
    }

# ---------------------------------------------------------
# 11. APPOINTMENTS MANAGEMENT
# ---------------------------------------------------------
@router.get("/appointments")
def get_all_appointments(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    appointments = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor),
        joinedload(Appointment.department),
        joinedload(Appointment.status),
        joinedload(Appointment.assignedSchedule)
    ).order_by(Appointment.createdAt.desc()).all()

    formatted_appts = []
    
    for a in appointments:
        time_str = "TBD"
        if a.assignedSchedule:
            start = a.assignedSchedule.startTime.strftime("%I:%M %p").lstrip("0")
            end = a.assignedSchedule.endTime.strftime("%I:%M %p").lstrip("0")
            time_str = f"{start} - {end}"

        status_name = a.status.statusName if a.status else "Pending"
        doc_name = f"Dr. {a.doctor.firstname} {a.doctor.surname}" if a.doctor else "Unassigned"
        dept_name = a.department.department if a.department else "N/A"
        is_specialty = (a.department.type == "Specialty") if a.department else False
        hosp_num = a.patient.hospital_num if a.patient and a.patient.hospital_num else "Unregistered"
        patient_name = f"{a.patient.firstname} {a.patient.surname}" if a.patient else "Unknown"

        # Note: 'cancelReason', 'approvedBy', and 'approvedDate' are not currently 
        # in your db_model.py. We will mock them based on the status for now!
        cancel_reason = "Cancelled by patient/staff" if status_name == "Cancelled" else None
        approved_by = "System Admin" if status_name in ["Approved", "Completed"] else None
        approved_date = a.createdAt.strftime("%m/%d/%Y") if status_name in ["Approved", "Completed"] else None

        formatted_appts.append({
            "raw_id": a.appointmentID,
            "id": f"APPT-{a.appointmentID:06d}",
            "hospitalNum": hosp_num,
            "patient": patient_name,
            "dept": dept_name,
            "isSpecialty": is_specialty,
            "doctor": doc_name,
            "status": status_name,
            "date": a.preferredStartDate.strftime("%m/%d/%Y"),
            "time": time_str,
            "cancelReason": cancel_reason,
            "approvedBy": approved_by,
            "approvedDate": approved_date,
            "lastUpdate": a.createdAt.strftime("%m/%d/%Y %I:%M %p")
        })

    return formatted_appts

@router.get("/appointments")
def get_all_appointments(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    appointments = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor),
        joinedload(Appointment.department),
        joinedload(Appointment.status),
        joinedload(Appointment.assignedSchedule),
        joinedload(Appointment.action_by_user).joinedload(User.staff_profile) # Eager load the staff name!
    ).order_by(Appointment.createdAt.desc()).all()

    formatted_appts = []
    for a in appointments:
        time_str = "TBD"
        if a.assignedSchedule:
            start = a.assignedSchedule.startTime.strftime("%I:%M %p").lstrip("0")
            end = a.assignedSchedule.endTime.strftime("%I:%M %p").lstrip("0")
            time_str = f"{start} - {end}"

        status_name = a.status.statusName if a.status else "Pending"
    
        action_name = "--"
        if a.action_by_user:
            if a.action_by_user.staff_profile:
                action_name = f"{a.action_by_user.staff_profile.firstname} {a.action_by_user.staff_profile.surname}"
            else:
                action_name = "System Admin"

        formatted_appts.append({
            "raw_id": a.appointmentID,
            "id": f"APPT-{a.appointmentID:06d}",
            "hospitalNum": a.patient.hospital_num if a.patient and a.patient.hospital_num else "Unregistered",
            "patient": f"{a.patient.firstname} {a.patient.surname}" if a.patient else "Unknown",
            "dept": a.department.department if a.department else "N/A",
            "isSpecialty": (a.department.type == "Specialty") if a.department else False,
            "doctor": f"Dr. {a.doctor.firstname} {a.doctor.surname}" if a.doctor else "Unassigned",
            "status": status_name,
            "date": a.preferredStartDate.strftime("%m/%d/%Y"),
            "time": time_str,
            
            "cancelReason": a.actionReason if status_name == "Cancelled" else None,
            "approvedBy": action_name if status_name != "Pending" else None,
            "approvedDate": a.actionDate.strftime("%m/%d/%Y %I:%M %p") if a.actionDate else None,
            "lastUpdate": a.createdAt.strftime("%m/%d/%Y %I:%M %p")
        })

    return formatted_appts

@router.put("/appointments/{appt_id}/action")
def update_appointment_status(
    appt_id: int, 
    data: AppointmentAction, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.appointmentID == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    target_status = db.query(AppointmentStatus).filter(AppointmentStatus.statusName == data.status).first()
    if not target_status:
        raise HTTPException(status_code=400, detail=f"Status '{data.status}' is invalid.")

    appt.statusID = target_status.statusID
    appt.actionBy_userID = current_user.userID
    appt.actionReason = data.reason
    appt.actionDate = datetime.now()

    action_enum = actionTypeEnum.APPROVE if data.status == "Approved" else actionTypeEnum.UPDATE
    if data.status == "Cancelled": action_enum = actionTypeEnum.DENY

    new_log = SystemLogs(
        userID=current_user.userID, actionType=action_enum, tableAffected="appointmentTable",
        details=f"Marked Appointment #{appt.appointmentID} as {data.status}", ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    return {"message": f"Appointment successfully marked as {data.status}!"}

# ---------------------------------------------------------
# 12. UNIFIED NOTIFICATIONS FEED
# ---------------------------------------------------------
@router.get("/notifications")
def get_admin_notifications(db: Session = Depends(get_db), current_admin: User = Depends(get_current_user)):
    # Fetch the newest audit logs (Staff/Admin Actions)
    recent_audits = db.query(SystemLogs).order_by(SystemLogs.timestamp.desc()).limit(20).all()
    
    # Fetch the newest health logs (System/Hardware Alerts)
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
            "id": f"audit_{a.logID}",
            "raw_date": a.timestamp.isoformat(), # Used for precise sorting in React
            "title": title,
            "desc": a.details,
            "type": "audit",
            "action": action
        })

    for h in recent_health:
        notifications.append({
            "id": f"health_{h.logID}",
            "raw_date": h.timestamp.isoformat(),
            "title": f"System Alert: {h.module}",
            "desc": h.description,
            "type": "alert",
            "priority": h.priority
        })
    notifications.sort(key=lambda x: x["raw_date"], reverse=True)
    
    return notifications[:30]

# ---------------------------------------------------------
# 13. ACCOUNT PROFILE MANAGEMENT
# ---------------------------------------------------------
@router.get("/profile/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    try:
        prof = current_user.staff_profile
        
        if isinstance(prof, list):
            prof = prof[0] if len(prof) > 0 else None

        user_role = current_user.role.value.upper() if hasattr(current_user.role, 'value') else str(current_user.role).upper()

        if not prof:
            return {
                "email": current_user.email, "role": user_role,
                "firstname": "System", "surname": "Admin", "suffix": "",
                "contactNumber": "", "dob": "", "gender": "Male", "address": "", "profilePhoto": None
            }

        fname = getattr(prof, 'firstname', "System")
        lname = getattr(prof, 'surname', "Admin")
        suffix = getattr(prof, 'suffix', "")
        contact = getattr(prof, 'contactNumber', "")
        gender = getattr(prof, 'gender', "Male")
        address = getattr(prof, 'address', "")
        photo = getattr(prof, 'profilePhoto', None)
        raw_dob = getattr(prof, 'dob', None)

        dob_str = ""
        if raw_dob:
            if hasattr(raw_dob, 'strftime'):
                dob_str = raw_dob.strftime("%m/%d/%Y")
            else:
                try:
                    dob_str = datetime.strptime(str(raw_dob), "%Y-%m-%d").strftime("%m/%d/%Y")
                except Exception:
                    dob_str = str(raw_dob)

        return {
            "email": current_user.email,
            "role": user_role,
            "firstname": fname or "System",
            "surname": lname or "Admin",
            "suffix": suffix or "",
            "contactNumber": contact or "",
            "dob": dob_str,
            "gender": gender or "Male",
            "address": address or "",
            "profilePhoto": photo
        }
        
    except Exception as e:
        print(f"CRITICAL ERROR in /profile/me: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/update-profile")
def update_my_profile(
    data: ProfileUpdate, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    prof = current_user.staff_profile
    
    if isinstance(prof, list):
        prof = prof[0] if len(prof) > 0 else None
        
    if not prof:
        prof = Staff(userID=current_user.userID)
        db.add(prof)
    
    prof.firstname = data.firstname
    prof.surname = data.surname
    prof.suffix = data.suffix
    prof.contactNumber = data.contactNumber
    prof.gender = data.gender
    prof.address = data.address
    
    try:
        if data.dob:
            prof.dob = datetime.strptime(data.dob, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    new_log = SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="staffTable",
        details=f"Updated personal account profile", ipAddress=request.client.host
    )
    db.add(new_log)

    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/upload-photo")
def upload_profile_photo(
    request: Request,
    profile_photo: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    prof = current_user.staff_profile
    
    if isinstance(prof, list):
        prof = prof[0] if len(prof) > 0 else None
        
    if not prof:
        prof = Staff(userID=current_user.userID, firstname="System", surname="Admin")
        db.add(prof)

    file_extension = profile_photo.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_location = f"uploads/{unique_filename}"

    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(profile_photo.file, file_object)


    photo_url = f"/uploads/{unique_filename}"
    
    if hasattr(prof, 'profilePhoto'):
        prof.profilePhoto = photo_url
    
    db.commit()
    return {"photo_url": photo_url}

# ---------------------------------------------------------
# 14. SECURE CREDENTIAL UPDATES
# ---------------------------------------------------------
@router.put("/change-email")
def change_account_email(
    data: EmailChangeRequest, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    existing_user = db.query(User).filter(User.email == data.new_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already connected to another account.")

    current_user.email = data.new_email
    
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, 
        tableAffected="userTable", details="Personnel updated their login email", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Email updated successfully!", "new_email": data.new_email}

@router.put("/change-password")
def change_account_password(
    data: PasswordChangeRequest, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    current_user.passwordHash = pwd_context.hash(data.new_password)
    
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, 
        tableAffected="userTable", details="Personnel updated their login password", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Password updated successfully!"}

# ---------------------------------------------------------
# 15. SYSTEM SETTINGS MANAGEMENT
# ---------------------------------------------------------
@router.get("/settings")
def get_system_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")

    settings = db.query(SystemSettings).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings

@router.put("/settings")
def update_system_settings(updated_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role.value != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")

    settings = db.query(SystemSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    for key, value in updated_data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()
    return {"message": "System settings completely updated!"}
    
@router.post("/backup")
def trigger_manual_backup(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    if current_user.role.value != "Admin":
        raise HTTPException(status_code=403, detail="Unauthorized. Admins only.")
        
    result = perform_database_backup()
    
    if not result["success"]:
        print(f"🚨 BACKUP FAILED: {result['error']}")
        raise HTTPException(status_code=500, detail="Backup failed to generate on the server.")

    try:

        new_log = SystemLogs(
            userID=current_user.userID,
            tableAffected="Entire Database",
            actionType=actionTypeEnum.UPDATE, 
            details=f"Manual system backup successfully generated. File: {result['filename']}"
        )
        db.add(new_log)
        db.commit()
    except Exception as e:
        print(f"⚠️ BACKUP SUCCEEDED, BUT LOGGING FAILED: {e}")

    print(f"✅ BACKUP SUCCESS: Saved to {result['filepath']}")
    return {
        "message": "Backup sequence completed successfully!",
        "filename": result["filename"]
    }

# ---------------------------------------------------------
# 16. ADMIN CALENDAR
# ---------------------------------------------------------
@router.get("/calendar")
def get_admin_calendar_data(
    month: str, 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    try:
        target_year, target_month = map(int, month.split('-'))

        events_in_month = db.query(CalendarEvent).filter(
            extract('year', CalendarEvent.date) == target_year,
            extract('month', CalendarEvent.date) == target_month
        ).all()

        formatted_events = [
            {
                "id": e.eventID, 
                "title": e.title, 
                "description": e.description, 
                "date": e.date.strftime("%Y-%m-%d"), 
                "type": (e.type.value if hasattr(e.type, 'value') else str(e.type)).upper()
            } for e in events_in_month
        ]

        appointments = db.query(
            Appointment.assignedDate,
            Appointment.statusID,
            func.count(Appointment.appointmentID).label('count')
        ).filter(
            extract('year', Appointment.assignedDate) == target_year,
            extract('month', Appointment.assignedDate) == target_month,
            Appointment.assignedDate != None
        ).group_by(Appointment.assignedDate, Appointment.statusID).all()

        daily_stats = {}
        for appt_date, status_id, count in appointments:
            date_str = appt_date.strftime("%Y-%m-%d")
            
            if date_str not in daily_stats:
                daily_stats[date_str] = {"date": date_str, "confirmed": 0, "canceled": 0, "noShow": 0, "completed": 0}
            
            if status_id in [2, 5, 6]: 
                daily_stats[date_str]["confirmed"] += count
            elif status_id in [3, 4]: 
                daily_stats[date_str]["canceled"] += count
            elif status_id == 8: 
                daily_stats[date_str]["noShow"] += count
            elif status_id == 9: 
                daily_stats[date_str]["completed"] += count

        settings = db.query(SystemSettings).first()
        capacity = settings.dailyCapacity if settings else 25

        return {
            "appointments": list(daily_stats.values()),
            "events": formatted_events,
            "capacity": capacity
        }
        
    except Exception as e:
        print(f"Calendar Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch calendar data")

@router.post("/calendar/events")
def create_calendar_event(
    data: CalendarEventCreate, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_user)
):
    """Creates a new Event or Holiday on the calendar."""
    try:
        parsed_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        
        safe_type = data.type.capitalize() 

        new_event = CalendarEvent(
            title=data.title,
            description=data.description if data.description else None,
            date=parsed_date,
            type=safe_type
        )
        db.add(new_event)

        new_log = SystemLogs(
            userID=current_admin.userID,
            actionType=actionTypeEnum.INSERT,
            tableAffected="calendarEventTable",
            details=f"Added new calendar {data.type.lower()}: {data.title}",
            ipAddress=request.client.host
        )
        db.add(new_log)

        db.commit()
        
        return {"message": f"{safe_type} created successfully"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")
    except Exception as e:
        db.rollback()
        print(f"Event Creation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create event")
    
