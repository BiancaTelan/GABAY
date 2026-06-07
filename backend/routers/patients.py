from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from dependencies import get_current_user
from db_connection import get_db
from db_model import User, Patient
from py_schema import HospitalNumberRequest, PatientProfileUpdate, ContactFormRequest
from email_utils import send_contact_us_email
from datetime import datetime, date

router = APIRouter(prefix="/patients", tags=["Patient Management"])

# ---------------------------------------------------------
# 1. HOSPITAL NUMBER GENERATION
# ---------------------------------------------------------
@router.post("/generate-hospital-number")
def generate_hospital_number(request: HospitalNumberRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        patient = db.query(Patient).filter(Patient.userID == user.userID).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")

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
        db.commit()

        return {
            "message": "Hospital number generated successfully.",
            "hospital_num": new_hospital_number,
            "patientName": f"{patient.firstname} {patient.surname}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ ERROR GENERATING ID: {str(e)}\n")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

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
        "surname": patient.surname,
        "email": user.email,
        "is_verified": user.is_verified,
        "hospital_num": patient.hospital_num or "",
        "dob": formatted_dob,
        "gender": patient.gender or "Female",
        "contactNumber": patient.contactNumber or "",
        "address": patient.address or "",
        "emergencyContact": patient.emergencyContact or "",
        "emergencyContactNum": patient.emergencyContactNum or "",
        "emergencyEmail": patient.emergencyEmail or ""
    }

# ---------------------------------------------------------
# 3. UPDATE PATIENT PROFILE
# ---------------------------------------------------------
@router.put("/update-profile")
def update_patient_profile(
    data: PatientProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.userID == current_user.userID).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    try:
        dob_date = datetime.strptime(data.dob, "%Y-%m-%d").date()
        today = date.today()
        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
        
        if age < 18:
            raise HTTPException(status_code=400, detail="You must be at least 18 years old to register or update a profile.")
            
        patient.dob = dob_date
    except ValueError:
        raise HTTPException(status_code=400, detail="Date format must be YYYY-MM-DD.")

    patient.firstname = data.firstname
    patient.surname = data.surname
    patient.middlename = data.middlename 
    patient.contactNumber = data.contactNumber
    patient.gender = data.gender
    
    safe_address = f"{data.street} | {data.barangay} | {data.city} | {data.province}"
    patient.address = safe_address

    patient.emergencyContact = data.emergencyContact
    patient.emergencyContactNum = data.emergencyContactNum
    patient.emergencyEmail = data.emergencyEmail

    db.commit()
    return {"message": "Profile successfully updated!"}
# ---------------------------------------------------------
# 4. PATIENT ACCOUNT DELETION
# ---------------------------------------------------------

@router.delete("/delete-account")
def delete_user_account(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        user_to_delete = db.query(User).filter(User.userID == current_user.userID).first()
        
        if not user_to_delete:
            raise HTTPException(status_code=404, detail="User not found.")

        db.delete(user_to_delete)
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
    background_tasks: BackgroundTasks
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