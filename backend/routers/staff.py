from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db_connection import get_db
from db_model import Appointment, SystemLogs, actionTypeEnum, User
from security import get_current_user

# Assuming this is your staff router
router = APIRouter(prefix="/staff", tags=["Staff"])

# ---------------------------------------------------------
# 1. STAFF ACTION: APPROVE APPOINTMENT
# ---------------------------------------------------------
@router.put("/appointments/{appointment_id}/approve")
def approve_appointment(
    appointment_id: int, 
    request: Request, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user) 
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.statusID = 5 

    # 3. --- CROSS-SYSTEM AUDIT LOGGING ---
    new_log = SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.APPROVE,
        tableAffected="appointmentTable",
        details=f"Approved appointment #{appointment.appointmentID} for Patient ID {appointment.patientID}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    
    return {"message": "Appointment approved and logged successfully."}

# ---------------------------------------------------------
# 1. STAFF ACTION: RESCHEDULE APPOINTMENT
# ---------------------------------------------------------
@router.put("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: int, 
    new_date: str, 
    request: Request, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.statusID = 6 

    old_date = appointment.assignedScheduleID
    appointment.assignedScheduleID = new_date

    new_log = SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.RESCHEDULE,
        tableAffected="appointmentTable",
        details=f"Rescheduled appointment #{appointment.appointmentID} from {old_date} to {new_date}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    
    return {"message": "Appointment rescheduled and logged successfully."}

# ---------------------------------------------------------
# 1. STAFF ACTION: DENIED APPOINTMENT
# ---------------------------------------------------------
@router.put("/appointments/{appointment_id}/deny")
def deny_appointment(
    appointment_id: int, 
    request: Request, 
    db: Session = Depends(get_db),
    current_staff: User = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.appointmentID == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.statusID = 4 

    new_log = SystemLogs(
        userID=current_staff.userID,
        actionType=actionTypeEnum.DENY,
        tableAffected="appointmentTable",
        details=f"Denied appointment #{appointment.appointmentID} for Patient ID {appointment.patientID}",
        ipAddress=request.client.host
    )
    db.add(new_log)
    
    db.commit()
    
    return {"message": "Appointment denied and logged successfully."}