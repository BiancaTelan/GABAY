from fastapi import APIRouter, Depends, HTTPException, Request, File, UploadFile, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, cast, String
from db_connection import get_db
from db_model import Appointment, Department, Schedule, Staff, SystemLogs, actionTypeEnum, User, Patient, Doctor, DailyQueue, queueStatusEnum, AppointmentStatus
from security import get_current_user
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, date
from typing import Optional
from email_utils import send_patient_appointment_email
from zoneinfo import ZoneInfo
import calendar
import uuid
import shutil


router = APIRouter(prefix="/staff", tags=["Staff"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class ProfileUpdate(BaseModel):
    firstname: str
    surname: str
    mi: str = ""
    suffix: str = ""
    contactNumber: str
    dob: str
    gender: str
    address: str = ""

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

class StaffBookRequest(BaseModel):
    hospitalNo: str
    firstName: str
    lastName: str
    email: str
    contactNo: str
    address: str
    department_id: int
    doctor_id: int  
    date: str      
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

# ---------------------------------------------------------
# 1. STAFF ACTION: APPOINTMENT MANAGEMENT 
# ---------------------------------------------------------
@router.get("/appointments")
def get_staff_appointments(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):
    staff_profile = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
    if not staff_profile or not staff_profile.deptID:
        return []
    
    try:
        appointments = (
            db.query(Appointment)
            .filter(Appointment.deptID == staff_profile.deptID)
            .order_by(Appointment.createdAt.desc())
            .all()
        )

        status_mapping = {
            1: 'pending',
            2: 'confirmed', 
            3: 'canceled',
            4: 'denied',   
            5: 'approved',   
            6: 'rescheduled',
            7: 'book',
            8: 'no show'
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

            appt_date = "Not set"
            if getattr(appt, 'assignedDate', None):
                appt_date = appt.assignedDate.strftime("%m/%d/%Y")
            
            batch_time = "TBD"
            if appt.assignedSchedule and hasattr(appt.assignedSchedule, 'startTime'):
                batch_time = appt.assignedSchedule.startTime.strftime("%I:%M %p")
            

            results.append({
                "id": appt.appointmentID,
                "name": patient_name,
                "hospitalNo": hospitalNo,
                "reason": reason,                     
                "requestedStartDate": req_start,      
                "requestedEndDate": req_end,          
                "appointmentDate": appt_date,
                "batch": batch_time,
                "status": raw_status,
                "statusID": appt.statusID, 
                "assignedDoctor": doctor_name,
                "docID": appt.docID,
                "email": patient_email,
                "attachedFile": appt.referral_doc if hasattr(appt, 'referral_doc') else None
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

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == data.assigned_doctor_id,
        Schedule.weekDay == day_of_week 
    ).first()

    if not schedule_template:
        raise HTTPException(
            status_code=400, 
            detail=f"The assigned doctor (ID: {data.assigned_doctor_id}) does not have a schedule template for {day_of_week}s."
        )

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

    if patient_email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=patient_email, 
            name=patient_first, 
            status="Approved",
            doctor_name=doctor_full_name, 
            date=formatted_date,
            additional_notes="Please arrive 15 minutes before your batch time."
        )
    
    db.add(SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.APPROVE,
        tableAffected="appointmentTable",
        details=f"Approved appointment #{appointment.appointmentID} for {parsed_date} (Template: {day_of_week})",
        ipAddress=request.client.host
    ))
    
    db.commit()
    
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

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == appointment.docID,
        Schedule.weekDay == day_of_week
    ).first()

    if not schedule_template:
        raise HTTPException(status_code=400, detail="Doctor is not available on this newly selected date.")

    appointment.assignedDate = parsed_date
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

    patient_email = None
    if appointment.patient and appointment.patient.user_account:
        patient_email = appointment.patient.user_account.email 

    if patient_email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=patient_email, 
            name=appointment.patient.firstname, 
            status="Rescheduled", 
            doctor_name=f"Dr. {schedule_template.doctor.surname}", 
            date=parsed_date.strftime("%B %d, %Y"),
            additional_notes=f"Reason for schedule change: {data.reason}"
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

    schedule_template = db.query(Schedule).filter(
        Schedule.docID == data.doctor_id,
        Schedule.weekDay == day_of_week 
    ).first()

    if not schedule_template:
        raise HTTPException(status_code=400, detail="Doctor is not available on this date.")

    department_record = db.query(Department).filter(Department.deptID == data.department_id).first()
    
    if not department_record:
        raise HTTPException(status_code=400, detail="Department not found in database.")

    patient = db.query(Patient).filter(Patient.hospital_num == data.hospitalNo).first()
    if not patient:
        patient = Patient(
            hospital_num=data.hospitalNo,
            firstname=data.firstName,
            surname=data.lastName,
            email=data.email,
            contactNo=data.contactNo,
            address=data.address
        )
        db.add(patient)
        db.flush()

    new_appointment = Appointment(
        patientID=patient.patientID,
        docID=data.doctor_id,
        deptID=data.department_id,
        purposeDetailed=data.reason,
        statusID=2, 
        assignedDate=parsed_date,
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
        details=f"Staff booked appointment for Patient {data.hospitalNo} on {parsed_date}"
    ))
    
    db.commit()

    if data.email:
        background_tasks.add_task(
            send_patient_appointment_email, 
            recipient_email=data.email,     
            name=data.firstName,
            status="Approved", 
            doctor_name=f"Dr. {schedule_template.doctor.surname}", 
            date=parsed_date.strftime("%B %d, %Y"),
            additional_notes="This appointment was booked on your behalf by hospital staff."
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
                "firstname": "System", "surname": "Staff", "mi": "", "suffix": "",
                "contactNumber": "", "dob": "", "gender": "Male", "address": "", "profilePhoto": None
            }

        fname = getattr(prof, 'firstname', "System")
        lname = getattr(prof, 'surname', "Staff")
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
        # Import your 'Staff' model at the top of the file!
        prof = Staff(userID=current_user.userID) 
        db.add(prof)
    
    prof.firstname = data.firstname
    prof.surname = data.surname
    prof.mi = data.mi
    prof.suffix = data.suffix
    prof.contactNumber = data.contactNumber
    prof.gender = data.gender
    prof.address = data.address
    
    try:
        if data.dob:
            parsed_date = datetime.strptime(data.dob, "%m/%d/%Y").date()
            if hasattr(prof, 'birthdate'): prof.birthdate = parsed_date
            elif hasattr(prof, 'birthDate'): prof.birthDate = parsed_date
            elif hasattr(prof, 'birthday'): prof.birthday = parsed_date
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

    file_extension = profile_photo.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    file_location = f"uploads/{unique_filename}"

    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(profile_photo.file, file_object)

    base_url = str(request.base_url).rstrip("/")
    photo_url = f"/uploads/{unique_filename}"
    
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
    staff_profile = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
    if not staff_profile or not staff_profile.department:
        return []

    doctors = db.query(Doctor).filter(Doctor.department == staff_profile.department).all()
    results = []
    
    for doc in doctors:
        schedule_records = db.query(Schedule).filter(Schedule.docID == doc.docID).all()
        
        parsed_schedules = []
        for s in schedule_records:
            safe_day = s.weekDay.value if hasattr(s.weekDay, 'value') else str(s.weekDay)
            
            parsed_schedules.append({
                "id": s.scheduleID,
                "day": safe_day if s.weekDay else "TBD", # <-- UPDATED
                "time": f"{s.startTime.strftime('%I:%M %p')} - {s.endTime.strftime('%I:%M %p')}" if getattr(s, 'startTime', None) else "TBD"
            })
            
        results.append({
            "id": doc.docID,
            "name": f"Dr. {doc.firstname} {doc.surname}",
            "role": "Attending Physician",
            "department": doc.department.department if doc.department else "General",
            "availability": "Available" if getattr(doc, 'isAvailable', True) else "Not Available",
            
            "schedules": parsed_schedules 
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
            maxPatients=20 
        )
        db.add(new_schedule)
    
    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.INSERT, tableAffected="scheduleTable",
        details=f"Staff added new schedule blocks for Dr. {doctor.surname}", ipAddress=request.client.host
    ))
    
    db.commit()
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

    db.add(SystemLogs(
        userID=current_staff.userID, actionType=actionTypeEnum.UPDATE, tableAffected="scheduleTable",
        details=f"Staff updated schedule #{schedule_id}", ipAddress=request.client.host
    ))
    db.commit()
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
    return {"message": "Schedule deleted successfully"}

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
def get_dashboard_data(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):
   
    staff_profile = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
    if not staff_profile or not staff_profile.deptID:
        raise HTTPException(status_code=403, detail="Unauthorized: No department assigned.")

    ph_tz = ZoneInfo("Asia/Manila")
    today = datetime.now(ph_tz)
    today_date = today.date()

    dept_id = staff_profile.deptID
    current_year = today.year
    current_month = today.month
    today_name = today.strftime('%A') 

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

    noshow_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.ilike("%No Show%")).first()
    noshow_id = noshow_obj.statusID if noshow_obj else 8

    # === MONTHLY OVERVIEW STATS ===
    for_approval = db.query(Appointment).filter(
        Appointment.deptID == dept_id, 
        Appointment.statusID == pending_id,
        extract('year', Appointment.preferredStartDate) == current_year,
        extract('month', Appointment.preferredStartDate) == current_month
    ).count()

    approved_month = db.query(Appointment).filter(
        Appointment.deptID == dept_id, 
        Appointment.statusID.in_(valid_approved_ids), 
        extract('year', Appointment.assignedDate) == current_year,
        extract('month', Appointment.assignedDate) == current_month
    ).count()

    cancelled_month = db.query(Appointment).filter(
        Appointment.deptID == dept_id, 
        Appointment.statusID == cancelled_id,
        extract('year', Appointment.assignedDate) == current_year,
        extract('month', Appointment.assignedDate) == current_month
    ).count()

    # === DAILY SLOT CAPACITY ===
    active_doctors = db.query(Doctor).filter(
        Doctor.deptID == dept_id,
        Doctor.isAvailable == True 
    ).all()

    total_available_slots = 0

    for doctor in active_doctors:
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
            
    available_slots = total_available_slots

    # === DAILY QUEUE FETCHING (Strictly for Today) ===
    todays_appointments = db.query(Appointment).outerjoin(
        DailyQueue, Appointment.appointmentID == DailyQueue.appointmentID
    ).filter(
        Appointment.deptID == dept_id,
        Appointment.assignedDate == today_date,
        Appointment.statusID.in_(valid_approved_ids), 
        DailyQueue.queueID == None  
    ).all()

    raw_queue_records = db.query(DailyQueue).join(
        Appointment, DailyQueue.appointmentID == Appointment.appointmentID
    ).filter(
        Appointment.deptID == dept_id,
        Appointment.assignedDate == today_date,
        DailyQueue.queueStatus.in_([
            queueStatusEnum.Waiting, 
            queueStatusEnum.inProgress, 
            queueStatusEnum.Completed
        ])
    ).all()

    active_queue_records = []
    for q in raw_queue_records:
        if getattr(q, 'checkInTime', None) and q.checkInTime.date() < today_date:
            continue
            
        active_queue_records.append(q)

    def format_appt(appt, queue_record=None):
        patient = db.query(Patient).filter(Patient.patientID == appt.patientID).first()
        doctor = db.query(Doctor).filter(Doctor.docID == appt.docID).first()
        
        if queue_record:
            display_status = queue_record.queueStatus.value if hasattr(queue_record.queueStatus, 'value') else str(queue_record.queueStatus)
        else:
            status_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusID == appt.statusID).first()
            display_status = status_obj.statusName if status_obj else "Unknown"

        appt_time = appt.assignedSchedule.startTime.strftime('%I:%M %p') if appt.assignedSchedule else "TBD"

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
            "approved": approved_month, 
            "cancelled": cancelled_month, 
            "slot": available_slots 
        },
        "scheduledList": [format_appt(a) for a in todays_appointments],
        "queueList": [
            format_appt(db.query(Appointment).filter(Appointment.appointmentID == q.appointmentID).first(), q) 
            for q in active_queue_records
        ]
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
    
    appointment = db.query(Appointment).filter(
        Appointment.appointmentID == appointment_id, 
        Appointment.deptID == staff_profile.deptID
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found in your department.")

    now = datetime.now()

    if action == "add_to_queue":
        today = date.today()
        
        current_queue_count = db.query(DailyQueue).join(
            Appointment, DailyQueue.appointmentID == Appointment.appointmentID
        ).filter(
            Appointment.assignedDate == today, 
            Appointment.deptID == staff_profile.deptID
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
    return {"message": "Queue updated successfully"}

@router.get("/no-shows")
def get_no_shows(db: Session = Depends(get_db), current_staff: User = Depends(get_current_user)):
    staff_profile = db.query(Staff).filter(Staff.userID == current_staff.userID).first()
    noshow_id = get_status_id(db, "No Show")
    
    no_shows = db.query(Appointment).filter(
        Appointment.deptID == staff_profile.deptID,
        Appointment.statusID == noshow_id
    ).order_by(Appointment.assignedDate.desc()).all()

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

