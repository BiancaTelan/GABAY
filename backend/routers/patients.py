from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, date
from dependencies import get_current_user
from db_connection import get_db
from db_model import User, Patient, Appointment
from py_schema import HospitalNumberRequest, PatientProfileUpdate, ContactFormRequest
from email_utils import send_contact_us_email
from pydantic import BaseModel
from security import verify_system_operational
from fastapi.encoders import jsonable_encoder
from utils.audit_logger import log_audit_trail

router = APIRouter(prefix="/patients", tags=["Patient Management"])

# ---------------------------------------------------------
# 1. HOSPITAL NUMBER REGISTRATION AND GENERATION
# ---------------------------------------------------------
@router.post("/generate-hospital-number")
def generate_hospital_number(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    
    try:
        patient = db.query(Patient).filter(Patient.userID == current_user.userID).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        
        old_data_snapshot = jsonable_encoder(patient)

        if patient.hospital_num:
            return {
                "message": "Patient already has a hospital number.", 
                "hospital_num": patient.hospital_num
            }

        # === HOSPITAL NUMBER GENERATION ===
        current_year = datetime.now().strftime("%y") 
        prefix = f"{current_year}-"

        last_patient = db.query(Patient).filter(
            Patient.hospital_num.like(f"{prefix}%")
        ).order_by(desc(Patient.hospital_num)).first()

        if last_patient and last_patient.hospital_num:
            last_sequence = int(last_patient.hospital_num.split("-")[1])
            new_sequence = last_sequence + 1
        else:
            new_sequence = 1

        new_hospital_number = f"{prefix}{new_sequence:06d}"

        patient.hospital_num = new_hospital_number

        new_data_snapshot = jsonable_encoder(patient)   

        log_audit_trail(
            db=db,
            table_name="patientTable",
            action_type="UPDATE",
            record_id=patient.patientID,
            old_data=old_data_snapshot,
            new_data=new_data_snapshot,
            active_user_id=current_user.userID
        )

        db.commit()

        return {
            "message": "Hospital number generated successfully.",
            "hospital_num": new_hospital_number,
            "patientName": f"{patient.firstname} {patient.surname}"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    
class LinkHospitalNumberRequest(BaseModel):
    hospital_num: str

@router.put("/link-hospital-number")
def link_hospital_number(
    data: LinkHospitalNumberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.userID == current_user.userID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    
    existing = db.query(Patient).filter(Patient.hospital_num == data.hospital_num).first()

    old_data_snapshot = jsonable_encoder(patient)
    
    if not existing:
        raise HTTPException(status_code=400, detail="Invalid hospital number. This number is not recognized by the hospital system.")
    
    if existing.patientID != patient.patientID:
        if existing.userID is not None:
            raise HTTPException(status_code=400, detail="This hospital number is already securely registered to another online account.")
        
        if existing.firstname.strip().lower() != patient.firstname.strip().lower() or existing.surname.strip().lower() != patient.surname.strip().lower():
            raise HTTPException(status_code=400, detail="Verification failed. The name on this hospital number does not match your profile.")
        
        db.query(Appointment).filter(Appointment.patientID == existing.patientID).update({"patientID": patient.patientID})
        
        db.delete(existing)
        
    patient.hospital_num = data.hospital_num
    new_data_snapshot = jsonable_encoder(patient)

    log_audit_trail(
            db=db,
            table_name="patientTable",
            action_type="UPDATE",
            record_id=patient.patientID,
            old_data=old_data_snapshot,
            new_data=new_data_snapshot,
            active_user_id=current_user.userID
        )

    db.commit()
    
    return {"message": "Hospital number verified and linked successfully!"}

# ---------------------------------------------------------
# 2. PATIENT PROFILE MANAGEMENT
# ---------------------------------------------------------
@router.get("/profile/{email}")
def get_patient_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    patient = db.query(Patient).filter(Patient.userID == user.userID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    formatted_dob = patient.dob.strftime("%m/%d/%Y") if patient.dob else ""

    return {
        "firstname": patient.firstname,
        "middlename": patient.middlename or "",
        "surname": patient.surname,
        "suffix": patient.suffix or "",
        "email": user.email,
        "is_verified": user.is_verified,
        "hospital_num": patient.hospital_num or "",
        "dob": formatted_dob,
        "age": patient.age or "",
        "civilStatus": patient.civilStatus or "",
        "gender": patient.gender or "Female",
        "contactNumber": patient.contactNumber or "",
        "address": patient.address or "",
        "emergencyContact": patient.emergencyContact or "",
        "emergencyContactNum": patient.emergencyContactNum or "",
        "emergencyEmail": patient.emergencyEmail or "",
        # ADDED GUARDIAN FIELDS BELOW
        "guardianFirstName": patient.guardianFirstName or "",
        "guardianMiddleName": patient.guardianMiddleName or "",
        "guardianSurname": patient.guardianSurname or "",
        "guardianExtension": patient.guardianExtension or "",
        "guardianContactNum": patient.guardianContactNum or "",
        "guardianRelationship": patient.guardianRelationship or ""
    }

# ---------------------------------------------------------
# 3. UPDATE PATIENT PROFILE
# ---------------------------------------------------------
@router.put("/update-profile")
def update_patient_profile(
    data: PatientProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    sys_check: bool = Depends(verify_system_operational)
):
    patient = db.query(Patient).filter(Patient.userID == current_user.userID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    
    old_data_snapshot = jsonable_encoder(patient)

    try:
        dob_date = datetime.strptime(data.dob, "%Y-%m-%d").date()
        today = date.today()
        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
        
        if age < 0:
            raise HTTPException(status_code=400, detail="Date of birth cannot be in the future.")
        if age > 110:
            raise HTTPException(status_code=400, detail="Age cannot exceed 110 years old.")
        
        patient.dob = dob_date
        patient.age = age
        
        if age < 18 and not (data.guardianFirstName and data.guardianSurname and data.guardianContactNum):
            raise HTTPException(status_code=400, detail="Guardian details are strictly required for minors.")

    except ValueError:
        raise HTTPException(status_code=400, detail="Date format must be YYYY-MM-DD.")

    patient.firstname = data.firstname
    patient.surname = data.surname
    patient.middlename = data.middlename 
    patient.suffix = data.suffix
    patient.contactNumber = data.contactNumber
    patient.gender = data.gender
    patient.civilStatus = data.civilStatus
    
    s_street = data.street.replace("|", "").strip()
    s_barangay = data.barangay.replace("|", "").strip()
    s_city = data.city.replace("|", "").strip()
    s_province = data.province.replace("|", "").strip()
    s_postal = data.postalCode.replace("|", "").strip()

    safe_address = f"{s_street} | {s_barangay} | {s_city} | {s_province} | {s_postal}"
    patient.address = safe_address

    patient.emergencyContact = data.emergencyContact
    patient.emergencyContactNum = data.emergencyContactNum
    patient.emergencyEmail = data.emergencyEmail

    patient.guardianFirstName = data.guardianFirstName
    patient.guardianMiddleName = data.guardianMiddleName
    patient.guardianSurname = data.guardianSurname
    patient.guardianExtension = data.guardianExtension
    patient.guardianContactNum = data.guardianContactNum
    patient.guardianRelationship = data.guardianRelationship

    new_data_snapshot = jsonable_encoder(patient)   

    log_audit_trail(
        db=db,
        table_name="patientTable",
        action_type="UPDATE",
        record_id=patient.patientID,
        old_data=old_data_snapshot,
        new_data=new_data_snapshot,
        active_user_id=current_user.userID
    )

    db.commit()
    return {"message": "Profile successfully updated!"}

# ---------------------------------------------------------
# 4. PATIENT ACCOUNT DELETION
# ---------------------------------------------------------

@router.delete("/delete-account")
def delete_user_account(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    sys_check: bool = Depends(verify_system_operational)
):
    try:
        user_to_delete = db.query(User).filter(User.userID == current_user.userID).first()
        if not user_to_delete:
            raise HTTPException(status_code=404, detail="User not found.")
        
        old_data_snapshot = jsonable_encoder(user_to_delete)

        db.delete(user_to_delete)

        log_audit_trail(
            db=db,
            table_name="userTable",
            action_type="DELETE",
            record_id=user_to_delete.userID,
            old_data=old_data_snapshot,
            new_data=None,
            active_user_id=current_user.userID
        )
        db.commit()

        return {"message": "Account and all associated records have been permanently deleted."}

    except Exception as e:
        db.rollback()
        print(f"Delete Account Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account. Please try again later."
        )
    
# ---------------------------------------------------------
# 5. PATIENT CONTACT US
# ---------------------------------------------------------

@router.post("/contact-us")
async def submit_contact_form(
    request: ContactFormRequest, 
    background_tasks: BackgroundTasks,
    sys_check: bool = Depends(verify_system_operational)
):
    try:
        full_name = f"{request.firstname} {request.surname}"
        
        background_tasks.add_task(
            send_contact_us_email,
            name=full_name,
            user_email=request.email,
            subject=request.subject,
            message=request.message
        )
        
        return {"message": "Your message has been successfully sent to the hospital administration."}
        
    except Exception as e:
        print(f"Contact Us Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again later.") 