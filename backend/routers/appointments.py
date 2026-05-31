import os
import cloudinary
import cloudinary.uploader
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_current_user, RoleChecker
from py_schema import PatientResponse 
from db_connection import get_db
from db_model import User, Patient, Appointment, Department, Doctor, AppointmentStatus, roleEnum, Schedule
from email_utils import send_notification_email, send_appointment_received_email

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

allow_admin_and_staff = RoleChecker([roleEnum.Admin, roleEnum.Staff])
allow_medical_team = RoleChecker([roleEnum.Admin, roleEnum.Staff])

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

# ---------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------
class StatusUpdate(BaseModel):
    status: str

class RescheduleRequest(BaseModel):
    preferredStartDate: str 
    preferredEndDate: Optional[str] = None
    reason: str

# ---------------------------------------------------------
# 1. Strict Access (Only Admins, Staff, and Doctors)
# ---------------------------------------------------------
@router.get("/all-schedules", dependencies=[Depends(allow_medical_team)])
def get_all_hospital_schedules():
    
    return {"message": "Secure hospital schedule data returned."}

# ---------------------------------------------------------
# 2. General Authenticated Access (All logged-in users)
# ---------------------------------------------------------
@router.get("/my-profile")
def get_my_profile(current_user: User = Depends(get_current_user)):

    
    return {
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": getattr(current_user, 'is_verified', False),
        "message": f"Welcome to the GABAY portal, your ID is {current_user.user_ID}"
    }

# ---------------------------------------------------------
# 3. Main Appointment Endpoint 
# ---------------------------------------------------------

router = APIRouter(prefix="/appointments", tags=["Appointments"])

UPLOAD_DIR = "uploads/referrals"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/departments-and-doctors")
def get_departments_and_doctors(db: Session = Depends(get_db)):
    try:
        # 1. Fetch all departments from the database
        departments = db.query(Department).all()
        
        result = []
        for dept in departments:
            doctors = db.query(Doctor).filter(Doctor.deptID == dept.deptID).all()
            
            result.append({
                "id": dept.deptID,
                "name": dept.department,
                "type": dept.type, 
                "doctors": [doc.firstname + " " + doc.surname for doc in doctors] 
            })
            
        return {"departments": result}
        
    except Exception as e:
        print(f"Error fetching departments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch hospital data.")

@router.post("/book")
async def book_appointment(
    background_tasks: BackgroundTasks,
    email: str = Form(...),
    department: str = Form(...),
    doctor_name: str = Form(...),
    preferredStartDate: str = Form(...), 
    preferredEndDate: Optional[str] = Form(None),
    reason: str = Form(...),
    hasPreviousRecord: str = Form(...), 
    appointment_type: str = Form(...),  
    referral_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        
        if user.is_verified == False:
            raise HTTPException(
                status_code=403, 
                detail="Action Denied: You must verify your email address before booking an appointment."
            )

        patient = db.query(Patient).filter(Patient.userID == user.userID).first()
        department = db.query(Department).filter(Department.department == department).first()
        if not department:
            raise HTTPException(status_code=400, detail=f"Department '{department}' not found in database.")
        
        doc_id = None
        if doctor_name != "NONE":
            doc_clean = doctor_name.replace("Dr. ", "") 
            doctor = db.query(Doctor).filter(
                func.concat(Doctor.firstname, ' ', Doctor.surname) == doc_clean
            ).first()
            
            if doctor:
                doc_id = doctor.docID

        has_prev_record = True if hasPreviousRecord.lower() == 'true' else False

        file_path = None
        if appointment_type == "Specialty":
            if not referral_file:
                raise HTTPException(status_code=400, detail="Referral document is required for Specialty appointments.")
            
            result = cloudinary.uploader.upload(
                referral_file.file,
                folder="gabay_referrals/", 
                resource_type="auto"       
            )
            
            file_path = result.get("secure_url")

        start_date = datetime.strptime(preferredStartDate, "%Y-%m-%d").date()
        end_date = datetime.strptime(preferredEndDate, "%Y-%m-%d").date() if preferredEndDate else None

        active_statuses = [1, 2, 5, 6, 7]
        existing_booking = db.query(Appointment).filter(
            Appointment.patientID == patient.patientID,
            Appointment.preferredStartDate == start_date, 
            Appointment.statusID.in_(active_statuses)
        ).first()

        if existing_booking:
            raise HTTPException(
                status_code=400, 
                detail="You already have an active appointment request for this date. Please select a different date or cancel your existing request."
            )

        new_appointment = Appointment(
            patientID=patient.patientID,
            deptID=department.deptID,
            docID=doc_id,
            statusID=1, 
            purposeDetailed=reason,
            type=appointment_type,
            referral_doc=file_path,
            hasPreviousRecord=has_prev_record,
            preferredStartDate=start_date,
            preferredEndDate=end_date
        )
        
        db.add(new_appointment)
        db.commit()

        background_tasks.add_task(
            send_appointment_received_email, 
            recipient_email=user.email,
            name=f"{patient.firstname} {patient.surname}",
            department_name=department.department,
            appointment_type=appointment_type,
            start_date=start_date.strftime("%B %d, %Y"),
            end_date=end_date.strftime("%B %d, %Y") if end_date else "",
            doctor_name=doctor_name,
            reason=reason
        )

        return {"message": "Reservation submitted successfully!"}
    

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# 4. Appointment History Endpoint
# ---------------------------------------------------------
@router.get("/history/{email}")
def get_appointment_history(email: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        patient = db.query(Patient).filter(Patient.userID == user.userID).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")

        appointments = (
            db.query(Appointment)
            .filter(Appointment.patientID == patient.patientID)
            .order_by(func.coalesce(Appointment.actionDate, Appointment.createdAt).desc())
            .all()
        )

        history = []
        unread_count = 0
        for appt in appointments:
            dept = db.query(Department).filter(Department.deptID == appt.deptID).first()
            doc = db.query(Doctor).filter(Doctor.docID == appt.docID).first() if appt.docID else None
            status = db.query(AppointmentStatus).filter(AppointmentStatus.statusID == appt.statusID).first()
            status_name = status.statusName if status else "Pending Approval"

            if "Pending" in status_name:
                unread_count += 1

            display_date = "TBD"
        
            if getattr(appt, 'assignedDate', None):
                display_date = appt.assignedDate.strftime("%B %d, %Y")
                if getattr(appt, 'assignedSchedule', None) and getattr(appt.assignedSchedule, 'startTime', None):
                    display_date += f" ({appt.assignedSchedule.startTime.strftime('%I:%M %p')})"
                    
            elif getattr(appt, 'preferredStartDate', None):
                display_date = appt.preferredStartDate.strftime("%B %d, %Y")

            action_date = getattr(appt, 'actionDate', None) or appt.createdAt

            history.append({
                "id": appt.appointmentID,
                "date": display_date, 
                "doctor": f"Dr. {doc.surname}" if doc else "None Assigned",
                "department": dept.department if dept else "Unknown",
                "status": status_name,
                "type": appt.type,
                "reason": appt.purposeDetailed or "No reason provided.",
                "createdAt": appt.createdAt.strftime("%m/%d/%Y") if appt.createdAt else "Recently",
                "updatedAt": action_date.strftime("%B %d, %Y at %I:%M %p") if action_date else "Recently",
                "rawTimestamp": action_date.isoformat() if action_date else "" # Hidden sorting key
            })

        return {
            "appointments": history,
            "is_verified": user.is_verified,
            "unread_count": unread_count,
            "patient_name": f"{patient.firstname} {patient.surname}"
        }
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment history.")
       
# ---------------------------------------------------------
# 5. Update Appointment Status (Patient side)
# ---------------------------------------------------------
@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, request: StatusUpdate, db: Session = Depends(get_db)):
    try:
        appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found.")

        status_obj = db.query(AppointmentStatus).filter(AppointmentStatus.statusName == request.status).first()

        if not status_obj:
            status_obj = AppointmentStatus(statusName=request.status, statusColor="#e5e7eb")
            db.add(status_obj)
            db.commit()
            db.refresh(status_obj)

        appointment.statusID = status_obj.statusID
        db.commit()

        return {"message": f"Appointment successfully updated to {request.status}!"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# ---------------------------------------------------------
# 6. Main Reservation Endpoint (Patient Reschedule)
# ---------------------------------------------------------
@router.put("/{appointment_id}/reschedule")
def reschedule_appointment(appointment_id: int, request: RescheduleRequest, db: Session = Depends(get_db)):
    try:
        appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found.")

        start_date = datetime.strptime(request.preferredStartDate, "%Y-%m-%d").date()
        end_date = datetime.strptime(request.preferredEndDate, "%Y-%m-%d").date() if request.preferredEndDate else None

        appointment.preferredStartDate = start_date
        appointment.preferredEndDate = end_date
        appointment.purposeDetailed = f"[RESCHEDULED] New Reason: {request.reason} | Original Reason: {appointment.purposeDetailed}"
        
        if hasattr(appointment, 'assignedDate'):
            appointment.assignedDate = None
        if hasattr(appointment, 'assignedScheduleID'):
            appointment.assignedScheduleID = None
            
        if hasattr(appointment, 'actionDate'):
            appointment.actionDate = func.now()
        
        pending_status = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.like("%Pending%")).first()
        if pending_status:
            appointment.statusID = pending_status.statusID

        db.commit()

        return {"message": "Appointment successfully rescheduled and is pending approval."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# ---------------------------------------------------------
# 7. Doctor Availability Endpoint
# ---------------------------------------------------------
@router.get("/doctor-availability")
def get_doctor_availability(doctor_name: str, db: Session = Depends(get_db)):
    try:
        clean_name = doctor_name.replace("Dr. ", "").strip()
        
        doctor = db.query(Doctor).filter(
            func.concat(Doctor.firstname, ' ', Doctor.surname) == clean_name
        ).first()

        if not doctor:
            return {"working_days": [], "fully_booked_dates": []}

        templates = db.query(Schedule).filter(Schedule.docID == doctor.docID).all()
        day_map = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 0 }
        
        working_days = []
        for t in templates:
            day_str = str(t.weekDay).lower().split(".")[-1].strip()
            if day_str in day_map:
                working_days.append(day_map[day_str])

        booked_appointments = db.query(
            Appointment.assignedDate,
            func.count(Appointment.appointmentID).label('count')
        ).filter(
            Appointment.docID == doctor.docID,
            Appointment.statusID.in_([2, 5, 6]), 
            Appointment.assignedDate != None
        ).group_by(Appointment.assignedDate).all()

        fully_booked_dates = []
        for appt_date, count in booked_appointments:
            if count >= 20: 
                fully_booked_dates.append(appt_date.strftime("%Y-%m-%d"))

        return {
            "working_days": list(set(working_days)),
            "fully_booked_dates": fully_booked_dates
        }

    except Exception as e:
        print(f"Availability fetch error: {e}")
        return {"working_days": [], "fully_booked_dates": []}
    