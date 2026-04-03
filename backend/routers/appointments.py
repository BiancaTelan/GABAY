import os
import shutil
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from dependencies import get_current_user, RoleChecker
from py_schema import PatientResponse 
from db_connection import get_db
from db_model import User, Patient, Appointment, Department, Doctor, AppointmentStatus, roleEnum
from email_utils import send_notification_email

class StatusUpdate(BaseModel):
    status: str

class RescheduleRequest(BaseModel):
    preferredStartDate: str 
    preferredEndDate: Optional[str] = None
    reason: str

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

allow_admin_and_staff = RoleChecker([roleEnum.Admin, roleEnum.Staff])
allow_medical_team = RoleChecker([roleEnum.Admin, roleEnum.Staff])

# ---------------------------------------------------------
# ROUTE 1: Strict Access (Only Admins, Staff, and Doctors)
# ---------------------------------------------------------
@router.get("/all-schedules", dependencies=[Depends(allow_medical_team)])
def get_all_hospital_schedules():
    
    return {"message": "Secure hospital schedule data returned."}

# ---------------------------------------------------------
# ROUTE 2: General Authenticated Access (All logged-in users)
# ---------------------------------------------------------
@router.get("/my-profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
  
    return {
        "email": current_user.email,
        "role": current_user.role,
        "message": f"Welcome to the GABAY portal, your ID is {current_user.user_ID}"
    }

# ---------------------------------------------------------
# ROUTE 3: Main Rappointment Endpoint 
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
        patient = db.query(Patient).filter(Patient.userID == user.userID).first()

        department = db.query(Department).filter(Department.department == department).first()
        if not department:
            raise HTTPException(status_code=400, detail=f"Department '{department}' not found in database.")

        doc_id = None
        if doctor_name != "NONE":
            doctor = db.query(Doctor).filter(Doctor.firstname + ' ' + Doctor.surname == doctor_name).first()
            if doctor:
                doc_id = doctor.docID

        has_prev_record = True if hasPreviousRecord.lower() == 'true' else False

        file_path = None
        if appointment_type == "Specialty":
            if not referral_file:
                raise HTTPException(status_code=400, detail="Referral document is required for Specialty appointments.")
            
            timestamp = int(datetime.now().timestamp())
            safe_filename = f"{patient.hospital_num}_{timestamp}_{referral_file.filename}"
            file_path = os.path.join(UPLOAD_DIR, safe_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(referral_file.file, buffer)

        start_date = datetime.strptime(preferredStartDate, "%Y-%m-%d").date()
        end_date = datetime.strptime(preferredEndDate, "%Y-%m-%d").date() if preferredEndDate else None

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

        subject = "GABAY: Appointment Request Received - Cainta Municipal Hospital"

        body = f"""Dear {patient.firstname} {patient.surname},

        We have successfully received your appointment request for the {department.department} department.
        It is currently PENDING APPROVAL by our hospital staff.

        📝 RESERVATION DETAILS:
        - Type: {appointment_type} OPD
        - Preferred Date(s): {start_date} to {end_date or start_date}
        - Assigned Doctor: {doctor_name}
        - Reason: {reason}

        We will send another email once your schedule is officially confirmed.

        Thank you for using the GABAY System!
        """

        background_tasks.add_task(
            send_notification_email, 
            recipient_email=user.email, 
            subject=subject, 
            body=body
        )

        return {"message": "Reservation submitted successfully!"}
    

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# ROUTE 4: Appointment History Endpoint
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
            .order_by(Appointment.createdAt.desc())
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

            history.append({
                "id": appt.appointmentID,
                "date": appt.preferredStartDate.strftime("%m/%d/%Y"), 
                "doctor": doc.firstname + ' ' + doc.surname if doc else "None Assigned",
                "department": dept.department if dept else "Unknown",
                "status": status.statusName if status else "Pending Approval",
                "type": appt.type,
                "reason": appt.purposeDetailed or "No reason provided.",
                "referral": appt.referral_doc or None,
                "createdAt": appt.createdAt.strftime("%m/%d/%Y") if appt.createdAt else "Recently"
            })


        return {
            "appointments": history,
            "is_verified": user.is_verified,
            "unread_count": unread_count 
        }
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch appointment history.")

# ---------------------------------------------------------
#ROUTE 5: Update Appointment Status Patient side
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
# ROUTE 3: Main Reservation Endpoint 
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
        
        pending_status = db.query(AppointmentStatus).filter(AppointmentStatus.statusName.like("%Pending%")).first()
        if pending_status:
            appointment.statusID = pending_status.statusID

        db.commit()

        return {"message": "Appointment successfully rescheduled and is pending approval."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))