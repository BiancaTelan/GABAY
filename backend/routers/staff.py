from fastapi import APIRouter, Depends, HTTPException, Request, File, UploadFile, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, cast, String, or_
from db_connection import get_db
from db_model import Appointment, Department, Schedule, Staff, SystemLogs, actionTypeEnum, User, Patient, Doctor, DailyQueue, queueStatusEnum, AppointmentStatus, weekDayEnum
from security import get_current_user, verify_token
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, date, timedelta
from typing import Optional
from email_utils import send_patient_appointment_email
from zoneinfo import ZoneInfo
from fastapi.responses import StreamingResponse
from sse_manager import notifier
import asyncio
import calendar
import uuid
import cloudinary
import cloudinary.uploader
import os

router = APIRouter(prefix="/staff", tags=["Staff"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class ProfileUpdate(BaseModel):
    firstname: str
    surname: str
    middlename: Optional[str] = ""
    mi: str = ""
    suffix: str = ""
    contactNumber: str
    dob: str
    gender: str
    street: str = ""
    barangay: str = ""
    city: str = ""
    province: str = ""

class EmailChangeRequest(BaseModel):
    current_password: str
    new_email: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class AppointmentApproveRequest(BaseModel):
    assigned_date: str
    assigned_doctor_id: Optional[int] = None # Include this if your modal lets them assign doctors
    batch: Optional[str] = None
    approving_staff_name: str = ""

class StaffBookRequest(BaseModel):
    hospital_num: str
    firstname: str
    middlename: Optional[str] = ""
    surname: str
    email: str
    contactNo: str
    city: str
    province: str
    street: str
    barangay: str
    department_id: int
    doctor_id: int  
    date: str  
    batch: str    
    reason: str

class RescheduleRequest(BaseModel):
    new_date: str
    batch: str
    reason: str

class AppointmentDenyRequest(BaseModel):
    reason: str

class StatusUpdateRequest(BaseModel):
    availability: str

class ScheduleUpdateRequest(BaseModel):
    schedule: str  
    timePeriod: str
    maxPatients: int = 20

class DailyStatusRequest(BaseModel):
    status: str

# ---------------------------------------------------------
# 1. STAFF ACTION: APPOINTMENT MANAGEMENT 
# ---------------------------------------------------------
@router.get("/appointments")
def get_staff_appointments(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):
    try:
        appointments = (
            db.query(Appointment)
            .all()
        )

        status_mapping = {
            1: 'pending', 
            3: 'canceled',
            4: 'denied',   
            5: 'approved',   
            6: 'rescheduled',
            7: 'book',
            8: 'no show',
            9: 'completed'
        }

        results = []
        for appt in appointments:
            patient_name = f"{getattr(appt.patient, 'firstname', '')} {getattr(appt.patient, 'surname', '')}".strip() if appt.patient else "Unknown Patient"
            hospitalNo = getattr(appt.patient, 'hospital_num', 'N/A') if appt.patient else 'N/A'
            patient_email = appt.patient.user_account.email if (appt.patient and appt.patient.user_account) else "N/A"
            doctor_name = f"Dr. {getattr(appt.doctor, 'surname', '')}" if appt.doctor and getattr(appt.doctor, 'surname', None) else ""
            req_start = appt.preferredStartDate.strftime("%m/%d/%Y") if appt.preferredStartDate else ""
            req_end = appt.preferredEndDate.strftime("%m/%d/%Y") if appt.preferredEndDate else req_start
            reason = appt.purposeDetailed if appt.purposeDetailed else "Consultation"
            raw_status = status_mapping.get(appt.statusID, 'pending')
            department = appt.department.department if appt.department else "General"

            appt_date = "Not set"
            if getattr(appt, 'assignedDate', None):
                appt_date = appt.assignedDate.strftime("%m/%d/%Y")
            
            batch_time = "TBD"
            if getattr(appt, 'batch', None):
                batch_time = appt.batch
            elif appt.assignedSchedule and hasattr(appt.assignedSchedule, 'startTime'):
                batch_time = appt.assignedSchedule.startTime.strftime("%I:%M %p")
            
            approving_staff_name = ""
            if appt.actionBy_userID:
                approving_staff = db.query(Staff).filter(Staff.userID == appt.actionBy_userID).first()
                if approving_staff:
                    approving_staff_name = f"{approving_staff.firstname} {approving_staff.surname}"


            results.append({
                "id": appt.appointmentID,
                "name": patient_name,
                "hospitalNo": hospitalNo,
                "reason": reason,                     
                "requestedStartDate": req_start,      
                "requestedEndDate": req_end,          
                "appointmentDate": appt_date,
                "department": department,
                "batch": batch_time,
                "status": raw_status,
                "statusID": appt.statusID, 
                "assignedDoctor": doctor_name,
                "docID": appt.docID,
                "email": patient_email,
                "approvingStaffName": approving_staff_name,
                "attachedFile": appt.referral_doc if hasattr(appt, 'referral_doc') else None,
            })

        return results

    except Exception as e:
        print(f"Error fetching appointments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointments")

@router.put("/appointments/{appointment_id}/approve")
def approve_appointment(
    appointment_id: int, 
    data: AppointmentApproveRequest, 
    request: Request, 
    background_tasks: BackgroundTasks,  
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user) 
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        if "-" in data.assigned_date:
            parsed_date = datetime.strptime(data.assigned_date, "%Y-%m-%d").date()
        else:
            parsed_date = datetime.strptime(data.assigned_date, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date format received: {data.assigned_date}")

    day_of_week = parsed_date.strftime("%A")

    try:
        day_enum = weekDayEnum[day_of_week]  
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid day: {day_of_week}")

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == data.assigned_doctor_id,
        Schedule.weekDay == day_enum
    ).first()

    if not schedule_template:
        raise HTTPException(
            status_code=400, 
            detail=f"The assigned doctor (ID: {data.assigned_doctor_id}) does not have a schedule template for {day_of_week}s."
        )

    
    appointment.docID = data.assigned_doctor_id
    appointment.batch = data.batch

    appointment.assignedScheduleID = schedule_template.scheduleID
    appointment.assignedDate = parsed_date  
    appointment.statusID =  5

    appointment.actionBy_userID = current_staff.userID
    appointment.actionDate = func.now()
    appointment.actionReason = "Approved schedule"

    db.commit()

    patient_first = getattr(appointment.patient, 'firstname', 'Patient')
    patient_email = appointment.patient.user_account.email if (appointment.patient and appointment.patient.user_account) else "N/A"
    doctor_full_name = f"Dr. {getattr(schedule_template.doctor, 'surname', 'Assigned Doctor')}"
    formatted_date = parsed_date.strftime("%B %d, %Y")
    approving_staff_name = "Hospital Staff"
    if current_staff.userID:
        staff_record = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
        if staff_record:
            approving_staff_name = f"{staff_record.firstname} {staff_record.surname}"

    if patient_email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=patient_email, 
            name=appointment.patient.firstname, 
            status="Rescheduled", 
            doctor_name=f"Dr. {schedule_template.doctor.surname}", 
            date=parsed_date.strftime("%B %d, %Y"),
            approving_staff_name=approving_staff_name,
            additional_notes=f"Reason for schedule change: {data.reason}"
        )

    return {"message": "Appointment successfully rescheduled."}
    
    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.APPROVE,
        tableAffected="appointmentTable",
        details=f"Approved appointment #{appointment.appointmentID} for {parsed_date} (Template: {day_of_week})",
        ipAddress=request.client.host
    ))
    
    db.commit()

    notifier.broadcast_sync({
        "title": "Appointment Approved",
        "desc": f"Approved appointment #{appointment.appointmentID}",
        "action": "APPROVE",
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Appointment scheduled successfully.", "assigned_date": str(parsed_date)}

@router.put("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: int,
    data: RescheduleRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        if "-" in data.new_date:
            parsed_date = datetime.strptime(data.new_date, "%Y-%m-%d").date()
        else:
            parsed_date = datetime.strptime(data.new_date, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    day_of_week = parsed_date.strftime("%A")

    try:
        day_enum = weekDayEnum[day_of_week]  
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid day: {day_of_week}")

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == appointment.docID,
        Schedule.weekDay == day_enum
    ).first()

    if not schedule_template:
        raise HTTPException(status_code=400, detail="Doctor is not available on this newly selected date.")

    appointment.assignedDate = parsed_date
    appointment.batch = data.batch
    appointment.assignedScheduleID = schedule_template.scheduleID
    appointment.statusID = 6 

    appointment.actionBy_userID = current_staff.userID
    appointment.actionDate = func.now()
    appointment.actionReason = f"Rescheduled: {data.reason}"

    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.UPDATE, 
        tableAffected="appointmentTable",
        details=f"Staff rescheduled appointment {appointment_id} to {parsed_date}. Reason: {data.reason}"
    ))

    db.commit()

    notifier.broadcast_sync({
        "title": "Appointment Rescheduled",
        "desc": f"Rescheduled appointment #{appointment.appointmentID}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })

    patient_email = None
    if appointment.patient and appointment.patient.user_account:
        patient_email = appointment.patient.user_account.email 

    approving_staff_name = "Hospital Staff"
    if current_staff.userID:
        staff_record = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
        if staff_record:
            approving_staff_name = f"{staff_record.firstname} {staff_record.surname}"

    if patient_email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=patient_email, 
            name=appointment.patient.firstname, 
            status="Rescheduled", 
            doctor_name=f"Dr. {schedule_template.doctor.surname}", 
            date=parsed_date.strftime("%B %d, %Y"),
            approving_staff_name=approving_staff_name,
            additional_notes=f"{data.reason}"
        )

    return {"message": "Appointment successfully rescheduled."}

@router.put("/appointments/{appointment_id}/deny")
def deny_appointment(
    appointment_id: int, 
    data: AppointmentDenyRequest,
    background_tasks: BackgroundTasks, 
    request: Request, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.statusID = 4 

    appointment.actionBy_userID = current_staff.userID
    appointment.actionDate = func.now()
    appointment.actionReason = f"Denied: {data.reason}"

    new_log = SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.DENY,
        tableAffected="appointmentTable",
        details=f"Denied appointment #{appointment.appointmentID}. Reason: {data.reason}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    db.commit()

    notifier.broadcast_sync({
        "title": "Appointment Denied",
        "desc": f"Denied appointment #{appointment.appointmentID}",
        "action": "DENY",
        "timestamp": datetime.now().isoformat()
    })

    patient_email = None
    if appointment.patient and appointment.patient.user_account:
        patient_email = appointment.patient.user_account.email 

    if patient_email:
        background_tasks.add_task(
            send_patient_appointment_email,
            recipient_email=patient_email,
            name=getattr(appointment.patient, 'firstname', 'Patient'),
            status="Denied",
            doctor_name="Hospital Staff", 
            date="N/A",
            additional_notes=f"Your appointment request was not approved. Reason: {data.reason}"
        )
    
    return {"message": "Appointment denied and patient notified."}

@router.get("/appointments/patient-lookup/{hospital_no}")
def lookup_patient(hospital_no: str, db: Session = Depends(get_db)):
    """
    Look up patient by hospital number for walk-in/proxy booking
    """
    patient = db.query(Patient).filter(Patient.hospital_num == hospital_no).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    # Split the concatenated address back into fields
    addr_parts = (patient.address or "").split(" | ")
    
    return {
        "firstname": patient.firstname,
        "middlename": patient.middlename or "",
        "surname": patient.surname,
        "email": patient.user_account.email if patient.user_account else "",
        "contactNo": patient.contactNumber or "",
        "street": addr_parts[0] if len(addr_parts) > 0 else "",
        "barangay": addr_parts[1] if len(addr_parts) > 1 else "",
        "city": addr_parts[2] if len(addr_parts) > 2 else "",
        "province": addr_parts[3] if len(addr_parts) > 3 else ""
    }
 
@router.post("/appointments/staff-book")
def staff_book_appointment(
    data: StaffBookRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    
    try:
        if "-" in data.date:
            parsed_date = datetime.strptime(data.date, "%Y-%m-%d").date()
        else:
            parsed_date = datetime.strptime(data.date, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    day_of_week = parsed_date.strftime("%A")

    try:
        day_enum = weekDayEnum[day_of_week]  # 
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid day: {day_of_week}")

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == data.doctor_id,
        Schedule.weekDay == day_enum
    ).first()

    if not schedule_template:
        raise HTTPException(status_code=400, detail="Doctor is not available on this date.")

    department_record = db.query(Department).filter(Department.deptID == data.department_id).first()
    
    if not department_record:
        raise HTTPException(status_code=400, detail="Department not found in database.")

    patient = db.query(Patient).filter(Patient.hospital_num == data.hospital_num).first()
    if not patient:
        patient = Patient(
            hospital_num=data.hospital_num,
            firstname=data.firstname,
            surname=data.surname,
            email=data.email,
            contactNo=data.contactNo,
            address=f"{data.street} | {data.barangay} | {data.city} | {data.province}"
        )
        db.add(patient)
        db.flush()
    
    active_statuses = [1, 2, 5, 6, 7]
    existing_booking = db.query(Appointment).filter(
        Appointment.patientID == patient.patientID,
        Appointment.statusID.in_(active_statuses),
        or_(
            Appointment.assignedDate == parsed_date,
            Appointment.preferredStartDate == parsed_date
        )
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=400, 
            detail="Double Booking Alert: This patient already has an active appointment or pending request scheduled for this date."
        )

    new_appointment = Appointment(
        patientID=patient.patientID,
        docID=data.doctor_id,
        deptID=data.department_id,
        purposeDetailed=data.reason,
        statusID=5, 
        assignedDate=parsed_date,
        batch=data.batch,
        assignedScheduleID=schedule_template.scheduleID,
        preferredStartDate=parsed_date, 
        preferredEndDate=parsed_date,
        actionBy_userID=current_staff.userID,
        actionDate=func.now(),
        actionReason="Booked by Staff"
    )
    db.add(new_appointment)
    
    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.BOOK,
        tableAffected="appointmentTable",
        details=f"Staff booked appointment for Patient {data.hospital_num} on {parsed_date}"
    ))
    
    db.commit()

    approving_staff_name = ""
    if new_appointment.actionBy_userID:
        approving_staff = db.query(Staff).filter(Staff.userID == new_appointment.actionBy_userID).first()
        if approving_staff:
            approving_staff_name = f"{approving_staff.firstname} {approving_staff.surname}"


    if data.email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=data.email,     
            name=data.firstname,
            status="Approved", 
            doctor_name=f"Dr. {schedule_template.doctor.surname}", 
            date=parsed_date.strftime("%B %d, %Y"),
            approving_staff_name=approving_staff_name,
            additional_notes="This appointment was booked by a hospital staff. Please arrive 15 minutes before your batch time."
        )

    return {"message": "Appointment successfully booked."}

@router.post("/appointments/{appointment_id}/notify")
def notify_patient_reminder(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    patient_email = None
    if appointment.patient and appointment.patient.user_account:
        patient_email = appointment.patient.user_account.email 

    if not patient_email:
        raise HTTPException(status_code=400, detail="This patient does not have an email address on file.")

    doctor_name = f"Dr. {appointment.doctor.surname}" if appointment.doctor else "Assigned Doctor"
    formatted_date = appointment.assignedDate.strftime("%B %d, %Y") if getattr(appointment, 'assignedDate', None) else "TBD"
    patient_first = getattr(appointment.patient, 'firstname', 'Patient')

    background_tasks.add_task(
        send_patient_appointment_email,
        recipient_email=patient_email,
        name=patient_first,
        status="Action Required", 
        doctor_name=doctor_name,
        date=formatted_date,
        additional_notes="ACTION REQUIRED: Please log into your portal to officially confirm your appointment. Unconfirmed appointments will be automatically released to other patients."
    )

    # 5. Log the action
    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.UPDATE, 
        tableAffected="appointmentTable",
        details=f"Staff manually pushed a confirmation reminder to patient for appointment #{appointment_id}",
        ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Appointment Reminder Sent",
        "desc": f"Reminder sent for appointment #{appointment.appointmentID}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })

    return {"message": "Reminder email successfully queued."}


# ---------------------------------------------------------
# 2. STAFF ACCOUNT PROFILE MANAGEMENT
# ---------------------------------------------------------
@router.get("/profile/me")
def get_staff_profile(current_user: User = Depends(get_current_user)):
    try:
        prof = current_user.staff_profile
        if isinstance(prof, list):
            prof = prof[0] if len(prof) > 0 else None

        user_role = current_user.role.value.upper() if hasattr(current_user.role, 'value') else str(current_user.role).upper()

        if not prof:
            return {
                "email": current_user.email, "role": user_role,
                "firstname": "System", "middlename": "", "surname": "Staff", "mi": "", "suffix": "",
                "contactNumber": "", "dob": "", "gender": "Male", "address": "", "profilePhoto": None
            }

        fname = getattr(prof, 'firstname', "System")
        lname = getattr(prof, 'surname', "Staff")
        middlename = getattr(prof, 'middlename', "")
        mi = getattr(prof, 'mi', "")
        suffix = getattr(prof, 'suffix', "")
        contact = getattr(prof, 'contactNumber', "")
        gender = getattr(prof, 'gender', "Male")
        address = getattr(prof, 'address', "")
        photo = getattr(prof, 'profilePhoto', None)
        
        raw_dob = getattr(prof, 'dob', None) or getattr(prof, 'birthdate', None) or getattr(prof, 'birthDate', None) or getattr(prof, 'birthday', None)

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
            "middlename": middlename or "",
            "surname": lname or "Staff",
            "mi": mi or "",
            "suffix": suffix or "",
            "contactNumber": contact or "",
            "dob": dob_str,
            "gender": gender or "Male",
            "address": address or "",
            "profilePhoto": photo
        }
    except Exception as e:
        print(f"CRITICAL ERROR in /staff/profile/me: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/update-profile")
def update_staff_profile(
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
    prof.middlename = data.middlename
    prof.mi = data.mi
    prof.suffix = data.suffix
    prof.contactNumber = data.contactNumber
    prof.gender = data.gender
    prof.address = f'{data.street} | {data.barangay} | {data.city} | {data.province}'
    
    try:
        if data.dob:
            parsed_date = datetime.strptime(data.dob, "%m/%d/%Y").date()
            if hasattr(prof, 'birthdate'): prof.dob = parsed_date
            elif hasattr(prof, 'birthDate'): prof.dob = parsed_date
            elif hasattr(prof, 'birthday'): prof.dob = parsed_date
            else: prof.dob = parsed_date
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    new_log = SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="staffTable",
        details="Updated personal account profile", ipAddress=request.client.host
    )
    db.add(new_log)
    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/upload-photo")
def upload_staff_profile_photo(
    request: Request,
    profile_photo: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    prof = current_user.staff_profile
    if isinstance(prof, list):
        prof = prof[0] if len(prof) > 0 else None
        
    if not prof:
        prof = Staff(userID=current_user.userID, firstname="System", surname="Staff")
        db.add(prof)

    result = cloudinary.uploader.upload(
        profile_photo.file,
        folder="gabay_profiles/"
    )
    
    photo_url = result.get("secure_url")
    
    if hasattr(prof, 'profilePhoto'):
        prof.profilePhoto = photo_url
    
    db.commit()
    return {"photo_url": photo_url}

@router.put("/change-email")
def change_staff_email(
    data: EmailChangeRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    existing_user = db.query(User).filter(User.email == data.new_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already connected to another account.")

    current_user.email = data.new_email
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="userTable", 
        details="Staff updated their login email", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Email updated successfully!", "new_email": data.new_email}

@router.put("/change-password")
def change_staff_password(
    data: PasswordChangeRequest, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not pwd_context.verify(data.current_password, current_user.passwordHash):
        raise HTTPException(status_code=401, detail="Verification failed: Incorrect current password.")

    current_user.passwordHash = pwd_context.hash(data.new_password)
    db.add(SystemLogs(
        userID=current_user.userID, actionType=actionTypeEnum.UPDATE, tableAffected="userTable", 
        details="Staff updated their login password", ipAddress=request.client.host
    ))
    db.commit()
    return {"message": "Password updated successfully!"}

# ---------------------------------------------------------
# 3. STAFF NOTIFICATIONS FEED
# ---------------------------------------------------------
@router.get("/notifications")
def get_staff_notifications(
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    recent_audits = db.query(SystemLogs).order_by(SystemLogs.timestamp.desc()).limit(30).all()
    
    notifications = []
    
    for a in recent_audits:
        action = a.actionType.value if hasattr(a.actionType, 'value') else str(a.actionType)
        title = "System Activity"
        
        if action in ["INSERT", "BOOK"]: title = "New Record Created"
        elif action in ["DELETE", "DENY"]: title = "Record Removed"
        elif action == "UPDATE": title = "Record Updated"
        elif action == "APPROVE": title = "Appointment Approved"
        elif action == "RESCHEDULE": title = "Appointment Rescheduled"
            
        notifications.append({
            "id": f"audit_{a.logID}",
            "raw_date": a.timestamp.isoformat() if a.timestamp else None, 
            "title": title,
            "desc": a.details,
            "type": "audit",
            "action": action
        })

    notifications.sort(key=lambda x: x["raw_date"], reverse=True)
    
    return notifications[:30]

@router.get("/notifications/stream")
async def stream_notifications(request: Request, token: str = Query(...), db: Session = Depends(get_db)):
    user = verify_token(token, db)
    if not user:
         raise HTTPException(status_code=401, detail="Invalid token")

    async def event_generator():
        yield "data: {\"type\": \"connected\"}\n\n"
        
        async for message in notifier.listen():
            if await request.is_disconnected():
                break
            yield f"data: {message}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------------------------------------------------------
# 4. CHECK SLOT AND DOCTOR AVAILABILITY
# ---------------------------------------------------------
@router.get("/appointments/check-availability")
def check_schedule_availability(
    doctor_id: int,
    date: str, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    try:
        if "-" in date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            target_date = datetime.strptime(date, "%m/%d/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    day_of_week = target_date.strftime("%A") 

    print("\n" + "="*40)
    print(f"🛑 DEBUG: Checking availability...")
    print(f"Doctor ID: {doctor_id}")
    print(f"Target Date: {target_date} ({day_of_week})")

    all_doctor_templates = db.query(Schedule).filter(Schedule.docID == doctor_id).all()
    db_days = [f"'{t.weekDay}'" for t in all_doctor_templates]
    print(f"Doctor's actual days in DB: {db_days}")
    print("="*40 + "\n")

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == doctor_id,
        Schedule.weekDay == day_of_week 
    ).first()

    if not schedule_template:
        return {
            "is_available": False,
            "reason": f"Doctor {doctor_id} does not have a schedule template for {day_of_week}s.",
            "slots_left": 0
        }

    max_capacity = schedule_template.maxPatients

    active_statuses = db.query(AppointmentStatus).filter(
        AppointmentStatus.statusName.ilike("%Approved%") |
        AppointmentStatus.statusName.ilike("%Confirmed%") |
        AppointmentStatus.statusName.ilike("%Rescheduled%") |
        AppointmentStatus.statusName.ilike("%Book%")
    ).all()
    valid_ids = [s.statusID for s in active_statuses] if active_statuses else [2, 5, 6, 7]

    booked_count = db.query(Appointment).filter(
        Appointment.docID == doctor_id,
        Appointment.assignedDate == target_date,
        Appointment.statusID.in_(valid_ids) 
    ).count()

    slots_left = max_capacity - booked_count

    return {
        "is_available": slots_left > 0,
        "max_capacity": max_capacity,
        "booked_count": booked_count,
        "slots_left": max(0, slots_left),
        "reason": "Fully booked" if slots_left <= 0 else "Slots available"
    }

@router.get("/doctors/{doctor_id}/working-days")
def get_doctor_working_days(
    doctor_id: int, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    templates = db.query(Schedule).filter(Schedule.docID == doctor_id).all()
    
    day_map = {
        "sunday": 0, "monday": 1, "tuesday": 2, 
        "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6
    }
    
    working_days = []
    for t in templates:
        raw_day_string = str(t.weekDay).lower() 
        
        if "." in raw_day_string:
            clean_day = raw_day_string.split(".")[-1].strip()
        else:
            clean_day = raw_day_string.strip()
            
        if clean_day in day_map:
            working_days.append(day_map[clean_day])
            
    return {"working_days": list(set(working_days))}

# ---------------------------------------------------------
# 5. DEPARTMENTS AND DOCTORS FEED
# ---------------------------------------------------------
@router.get("/departments-with-doctors")
def get_departments_and_doctors(
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    
    departments = db.query(Department).all()
    
    results = []
    for dept in departments:
        doctor_list = []
        
        for doc in dept.doctors: 
            doctor_list.append({
                "id": doc.docID, 
                "name": f"Dr. {doc.firstname} {doc.surname}"
            })
            
        results.append({
            "id": dept.deptID, 
            "name": dept.department,    
            "doctors": doctor_list
        })
        
    return results

# ---------------------------------------------------------
# 6. STAFF DOCTORS FEED
# ---------------------------------------------------------
@router.get("/doctors/list")
def get_staff_doctors(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):
    ph_tz = ZoneInfo("Asia/Manila")
    today = datetime.now(ph_tz)
    today_date = today.date()
    today_name = today.strftime('%A')

    doctors = db.query(Doctor).all()
    
    # Fetch active statuses to accurately count booked slots
    active_statuses = db.query(AppointmentStatus).filter(
        AppointmentStatus.statusName.ilike("%Approved%") |
        AppointmentStatus.statusName.ilike("%Confirmed%") |
        AppointmentStatus.statusName.ilike("%Rescheduled%") |
        AppointmentStatus.statusName.ilike("%Book%")
    ).all()
    valid_ids = [s.statusID for s in active_statuses] if active_statuses else [2, 5, 6, 7]

    results = []
    for doc in doctors:
        schedule_records = db.query(Schedule).filter(Schedule.docID == doc.docID).all()

        parsed_schedules = []
        today_schedule = None

        for s in schedule_records:
            safe_day = s.weekDay.value if hasattr(s.weekDay, 'value') else str(s.weekDay)
            time_str = f"{s.startTime.strftime('%I:%M %p')} - {s.endTime.strftime('%I:%M %p')}" if getattr(s, 'startTime', None) else "TBD"
            
            parsed_schedules.append({
                "id": s.scheduleID,
                "day": safe_day, 
                "time": time_str,
                "maxPatients": int(getattr(s, 'maxPatients', 20))
            })
            if safe_day.strip().lower() == today_name.lower():
                today_schedule = s

        available_slot = 0
        today_status = "Not Scheduled Today"
        
        if today_schedule:
            if not getattr(doc, 'isAvailable', True):
                today_status = "Inactive"
            elif getattr(doc, 'onLeaveDate', None) == today_date:
                today_status = "On Leave / Unavailable"
            else:
                today_status = "Available"
                booked_count = db.query(Appointment).filter(
                    Appointment.docID == doc.docID,
                    Appointment.assignedDate == today_date,
                    Appointment.statusID.in_(valid_ids)
                ).count()
                available_slot = max(0, int(getattr(today_schedule, 'maxPatients', 20)) - booked_count)

        schedule_display = "TBD"
        time_display = "TBD"
        if parsed_schedules:
            schedule_display = ", ".join([s['day'][:3] for s in parsed_schedules])
            time_display = parsed_schedules[0]['time']

        results.append({
            "id": doc.docID,
            "name": f"Dr. {doc.firstname} {doc.surname}",
            "role": "Attending Physician",
            "department": doc.department.department if doc.department else "General",
            "availability": "Available" if getattr(doc, 'isAvailable', True) else "Not Available",
            "isActive": getattr(doc, 'isAvailable', True),
            "isAvailable": getattr(doc, 'isAvailable', True),
            "schedules": parsed_schedules,
            "schedule": schedule_display, 
            "timePeriod": time_display,
            "contactNumber": getattr(doc, 'contactNumber', 'N/A'),
            "email": getattr(doc, 'email', 'N/A'),
            "todayStatus": today_status,
            "availableSlot": available_slot,
            "onLeaveDate": str(doc.onLeaveDate) if getattr(doc, 'onLeaveDate', None) else None
        })
        
    return results

@router.put("/doctors/{doctor_id}/availability")
def update_doctor_availability(
    doctor_id: int, 
    data: StatusUpdateRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.docID == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor.isAvailable = (data.availability == "Available")
    
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.UPDATE, tableAffected="doctorTable",
        details=f"Staff updated Dr. {doctor.surname} availability to {data.availability}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Doctor Availability Updated",
        "desc": f"Updated availability for Dr. {doctor.surname}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "Status updated"}

@router.put("/doctors/{doctor_id}/schedule")
def update_doctor_schedule(
    doctor_id: int, 
    data: ScheduleUpdateRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    schedule = db.query(Schedule).filter(Schedule.docID == doctor_id).first()
    
    if not schedule:
        schedule = Schedule(docID=doctor_id)
        db.add(schedule)
        
    schedule.weekDay = data.schedule
    
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.UPDATE, tableAffected="scheduleTable",
        details=f"Staff updated schedule for Dr. {doctor_id}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Schedule Updated",
        "desc": f"Updated schedule for Dr. {doctor_id}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "Schedule updated"}

@router.post("/doctors/{doctor_id}/schedule/add")
def add_doctor_schedule(
    doctor_id: int, 
    data: ScheduleUpdateRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.docID == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    try:
        normalized_time = data.timePeriod.replace("–", "-").replace("—", "-")
        raw_start, raw_end = normalized_time.split("-")
        
        parsed_start = datetime.strptime(raw_start.strip(), "%I:%M %p").time()
        parsed_end = datetime.strptime(raw_end.strip(), "%I:%M %p").time()
    except Exception as e:
        print(f"Time parsing error: {e}")
        raise HTTPException(status_code=400, detail="Invalid time format. Expected 'HH:MM AM/PM - HH:MM AM/PM'")
    
    day_mapping = {
        "M": "Monday",
        "T": "Tuesday",
        "W": "Wednesday",
        "TH": "Thursday",
        "F": "Friday",
        "S": "Saturday",
        "SU": "Sunday"
    }

    selected_short_days = [d.strip() for d in data.schedule.split(',')]

    for short_day in selected_short_days:
        full_day_name = day_mapping.get(short_day, short_day) 

        new_schedule = Schedule(
            docID=doctor_id,
            weekDay=full_day_name, 
            startTime=parsed_start,
            endTime=parsed_end,
            maxPatients=data.maxPatients 
        )
        db.add(new_schedule)
    
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.INSERT, tableAffected="scheduleTable",
        details=f"Staff added new schedule blocks for Dr. {doctor.surname}", ipAddress=request.client.host
    ))
    
    db.commit()

    notifier.broadcast_sync({
        "title": "Schedule Updated",
        "desc": f"Updated schedule for Dr. {doctor_id}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "New schedule blocks added successfully"}

@router.put("/doctors/schedule/{schedule_id}")
def edit_specific_schedule(
    schedule_id: int, 
    data: ScheduleUpdateRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    schedule = db.query(Schedule).filter(Schedule.scheduleID == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    try:
        normalized_time = data.timePeriod.replace("–", "-").replace("—", "-")
        raw_start, raw_end = normalized_time.split("-")
        
        parsed_start = datetime.strptime(raw_start.strip(), "%I:%M %p").time()
        parsed_end = datetime.strptime(raw_end.strip(), "%I:%M %p").time()
    except Exception as e:
        print(f"Time parsing error: {e}")
        raise HTTPException(status_code=400, detail="Invalid time format. Expected 'HH:MM AM/PM - HH:MM AM/PM'")

    day_mapping = { "M": "Monday", "T": "Tuesday", "W": "Wednesday", "TH": "Thursday", "F": "Friday", "S": "Saturday", "SU": "Sunday" }
    
    short_day = data.schedule.split(',')[0].strip()
    schedule.weekDay = day_mapping.get(short_day, short_day)
    schedule.startTime = parsed_start    
    schedule.endTime = parsed_end          
    schedule.maxPatients = data.maxPatients

    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.UPDATE, tableAffected="scheduleTable",
        details=f"Staff updated schedule #{schedule_id}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Schedule Updated",
        "desc": f"Updated schedule for Dr. {schedule.docID}",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "Schedule updated successfully"}

@router.delete("/doctors/schedule/{schedule_id}")
def delete_specific_schedule(
    schedule_id: int, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    schedule = db.query(Schedule).filter(Schedule.scheduleID == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    db.delete(schedule)
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.DELETE, tableAffected="scheduleTable",
        details=f"Staff deleted schedule #{schedule_id}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Schedule Deleted",
        "desc": f"Deleted schedule #{schedule_id}",
        "action": "DELETE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "Schedule deleted successfully"}

@router.put("/doctors/{doctor_id}/daily-status")
def update_daily_status(
    doctor_id: int, 
    data: DailyStatusRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.docID == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    ph_tz = ZoneInfo("Asia/Manila")
    today_date = datetime.now(ph_tz).date()

    if data.status == "Unavailable":
        doctor.onLeaveDate = today_date
    else:
        if doctor.onLeaveDate == today_date:
            doctor.onLeaveDate = None
            
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.UPDATE, tableAffected="doctorTable",
        details=f"Staff updated Dr. {doctor.surname} daily status to {data.status}", ipAddress=request.client.host
    ))
    db.commit()

    notifier.broadcast_sync({
        "title": "Daily Status Updated",
        "desc": f"Updated daily status for Dr. {doctor.surname}",
        "action": "UPDATE",
        "timestamp": datetime.now(ph_tz).isoformat()
    })
    return {"message": "Daily status updated"}

# ---------------------------------------------------------
# 7. DASHBOARD DATA ENDPOINTS
# ---------------------------------------------------------
def get_status_id(db: Session, status_name: str):
    status = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.ilike(status_name)).first()
    if not status:
        print(f"🚨 X-RAY WARNING: I cannot find '{status_name}' in your AppointmentStatus table!")
        return None
    return status.statusID

@router.get("/overview")
def get_dashboard_data(
    filter_time: str = Query("month"),
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    ph_tz = ZoneInfo("Asia/Manila")
    today = datetime.now(ph_tz)
    today_date = today.date()

    current_year = today.year
    current_month = today.month
    today_name = today.strftime('%A') 

    start_date = today_date
    end_date = today_date
    
    if filter_time == "week":
        start_date = today_date - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif filter_time == "month":
        start_date = today_date.replace(day=1)
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month - timedelta(days=next_month.day)

    # Status Identifiers
    active_statuses = db.query(AppointmentStatus).filter(
        AppointmentStatus.statusName.ilike("%Approved%") |
        AppointmentStatus.statusName.ilike("%Confirmed%") |
        AppointmentStatus.statusName.ilike("%Rescheduled%") |
        AppointmentStatus.statusName.ilike("%Book%")
    ).all()
    valid_approved_ids = [s.statusID for s in active_statuses] if active_statuses else [2, 5, 6, 7]

    pending_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.ilike("%Pending%")).first()
    pending_id = pending_obj.statusID if pending_obj else 1

    cancelled_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.ilike("%Cancelled%")).first()
    cancelled_id = cancelled_obj.statusID if cancelled_obj else 3

    # Base Queries
    approval_q = db.query(Appointment).filter(Appointment.statusID == pending_id)
    approved_q = db.query(Appointment).filter(Appointment.statusID.in_(valid_approved_ids))
    cancelled_q = db.query(Appointment).filter(Appointment.statusID == cancelled_id)

    if filter_time == "month":
        for_approval = approval_q.filter(extract('year', Appointment.preferredStartDate) == current_year, extract('month', Appointment.preferredStartDate) == current_month).count()
        approved_count = approved_q.filter(extract('year', Appointment.assignedDate) == current_year, extract('month', Appointment.assignedDate) == current_month).count()
        cancelled_count = cancelled_q.filter(extract('year', Appointment.assignedDate) == current_year, extract('month', Appointment.assignedDate) == current_month).count()
    else: 
        for_approval = approval_q.filter(Appointment.preferredStartDate >= start_date, Appointment.preferredStartDate <= end_date).count()
        approved_count = approved_q.filter(Appointment.assignedDate >= start_date, Appointment.assignedDate <= end_date).count()
        cancelled_count = cancelled_q.filter(Appointment.assignedDate >= start_date, Appointment.assignedDate <= end_date).count()

    # === DAILY SLOT CAPACITY (Remains daily regardless of filter) ===
    active_doctors = db.query(Doctor).filter(Doctor.isAvailable == True).all()
    total_available_slots = 0

    for doctor in active_doctors:
        if getattr(doctor, 'onLeaveDate', None) == today_date:
            continue
            
        doctor_schedules = db.query(Schedule).filter(Schedule.docID == doctor.docID).all()
        works_today = False
        daily_max = 0

        for sched in doctor_schedules:
            sched_day = sched.weekDay.value if hasattr(sched.weekDay, 'value') else str(sched.weekDay)
            if sched_day.strip().lower() == today_name.lower():
                works_today = True
                daily_max += int(getattr(sched, 'maxPatients', 20) or 20)
                
        if works_today:
            doctor_booked = db.query(Appointment).filter(
                Appointment.docID == doctor.docID,
                Appointment.assignedDate == today_date,
                Appointment.statusID.in_(valid_approved_ids)
            ).count()
            total_available_slots += max(0, daily_max - doctor_booked)

    # === DAILY QUEUE FETCHING (Remains daily regardless of filter) ===
    todays_appointments = db.query(Appointment).outerjoin(
        DailyQueue, Appointment.appointmentID == DailyQueue.appointmentID
    ).filter(
        Appointment.assignedDate == today_date,
        Appointment.statusID.in_(valid_approved_ids), 
        DailyQueue.queueID == None  
    ).all()

    raw_queue_records = db.query(DailyQueue).join(
        Appointment, DailyQueue.appointmentID == Appointment.appointmentID
    ).filter(
        Appointment.assignedDate == today_date,
        Appointment.statusID.in_(valid_approved_ids),
        DailyQueue.queueStatus.in_([queueStatusEnum.Waiting, queueStatusEnum.inProgress, queueStatusEnum.Completed])
    ).all()

    active_queue_records = [q for q in raw_queue_records if not (getattr(q, 'checkInTime', None) and q.checkInTime.date() < today_date)]

    def format_appt(appt, queue_record=None):
        patient = db.query(Patient).filter(Patient.patientID == appt.patientID).first()
        doctor = db.query(Doctor).filter(Doctor.docID == appt.docID).first()
        
        if queue_record:
            display_status = queue_record.queueStatus.value if hasattr(queue_record.queueStatus, 'value') else str(queue_record.queueStatus)
        else:
            status_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusID == appt.statusID).first()
            display_status = status_obj.statusName if status_obj else "Unknown"

        if getattr(appt, 'batch', None):
            appt_time = appt.batch
        elif appt.assignedSchedule and getattr(appt.assignedSchedule, 'startTime', None):
            appt_time = appt.assignedSchedule.startTime.strftime('%I:%M %p')
        else:
            appt_time = "TBD"

        return {
            "id": appt.appointmentID,
            "hospitalNumber": patient.hospital_num if patient and patient.hospital_num else "N/A",
            "name": f"{patient.firstname} {patient.surname}" if patient else "Unknown",
            "reason": appt.purposeDetailed or appt.type,
            "assignedDoctor": f"Dr. {doctor.surname}" if doctor else "Unassigned",
            "status": display_status,
            "time": appt_time
        }
    
    return {
        "stats": { 
            "forApproval": for_approval, 
            "approved": approved_count, 
            "cancelled": cancelled_count, 
            "slot": total_available_slots 
        },
        "scheduledList": [format_appt(a) for a in todays_appointments],
        "queueList": [format_appt(db.query(Appointment).filter(Appointment.appointmentID == q.appointmentID).first(), q) for q in active_queue_records]
    }

@router.put("/queue/{appointment_id}")
def update_queue_status(
    appointment_id: int, 
    action: str, 
    request: Request, 
    db: Session = Depends(get_db), 
    current_staff: User = Depends(get_current_user)
):
    staff_profile = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
    dept_ids = [d.deptID for d in staff_profile.departments] 
    
    appointment = db.query(Appointment).filter(
        Appointment.appointmentID == appointment_id, 
        Appointment.deptID.in_(dept_ids)
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found in your department.")

    ph_tz = ZoneInfo("Asia/Manila")
    manila_now = datetime.now(ph_tz)
    
    now = manila_now.replace(tzinfo=None)
    today = now.date()

    if action == "add_to_queue":
        current_queue_count = db.query(DailyQueue).join(
            Appointment, DailyQueue.appointmentID == Appointment.appointmentID
        ).filter(
            Appointment.assignedDate == today, 
            Appointment.deptID.in_(dept_ids) 
        ).count()
        
        existing_queue = db.query(DailyQueue).filter(DailyQueue.appointmentID == appointment_id).first()
        
        if existing_queue:
            existing_queue.queueStatus = queueStatusEnum.Waiting
            existing_queue.checkInTime = now
        else:
            new_queue = DailyQueue(
                appointmentID=appointment_id,
                queueNum=current_queue_count + 1,
                queueStatus=queueStatusEnum.Waiting,
                checkInTime=now
            )
            db.add(new_queue)

    elif action == "serving":
        queue = db.query(DailyQueue).filter(DailyQueue.appointmentID == appointment_id).first()
        if queue:
            queue.queueStatus = queueStatusEnum.inProgress
            queue.consultationStart = now

    elif action == "served":
        queue = db.query(DailyQueue).filter(DailyQueue.appointmentID == appointment_id).first()
        if queue:
            queue.queueStatus = queueStatusEnum.Completed
            queue.consultationEnd = now
        
        completed_id = get_status_id(db, "Completed")
        if completed_id:
            appointment.statusID = completed_id

    elif action == "no_show":
        noshow_id = get_status_id(db, "No Show")
        if noshow_id:
            appointment.statusID = noshow_id 
            
        queue = db.query(DailyQueue).filter(DailyQueue.appointmentID == appointment_id).first()
        if queue:
            queue.queueStatus = queueStatusEnum.noShow 

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    
    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.UPDATE, 
        tableAffected="dailyQueueTable",
        details=f"Updated queue status for Appointment #{appointment_id} to '{action.upper()}'",
        ipAddress=request.client.host
    ))

    db.commit()

    notifier.broadcast_sync({
        "title": "Queue Status Updated",
        "desc": f"Updated queue status for Appointment #{appointment_id} to '{action.upper()}'",
        "action": "UPDATE",
        "timestamp": datetime.now().isoformat()
    })
    return {"message": "Queue updated successfully"}

@router.get("/no-shows")
def get_no_shows(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):

    noshow_id = get_status_id(db, "No Show")
    no_shows = db.query(Appointment).filter(
        Appointment.statusID == noshow_id
    ).all()

    results = []
    for appt in no_shows:
        patient = db.query(Patient).filter(Patient.patientID == appt.patientID).first()
        doctor = db.query(Doctor).filter(Doctor.docID == appt.docID).first() if appt.docID else None
        
        time_str = "TBD"
        if appt.assignedSchedule:
             time_str = appt.assignedSchedule.startTime.strftime('%I:%M %p')

        results.append({
            "id": appt.appointmentID,
            "dateTime": f"{appt.assignedDate.strftime('%m/%d/%Y')} {time_str}" if appt.assignedDate else "Unknown",
            "patientName": f"{patient.firstname} {patient.surname}" if patient else "Unknown",
            "status": "No Show",
            "docID": appt.docID,
            "assignedDoctor": f"{doctor.firstname} {doctor.surname}" if doctor else "NONE",
            "hospitalNo": patient.hospital_num if patient else "N/A",
            "email": patient.user_account.email if (patient and patient.user_account) else "N/A"
        })
    return results

