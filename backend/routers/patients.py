from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from db_connection import get_db
from db_model import User, Patient
from py_schema import HospitalNumberRequest, PatientProfileUpdate

router = APIRouter(prefix="/patients", tags=["Patient Management"])

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

        new_hospital_number = f"{prefix}{new_sequence:05d}"

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
    
@router.put("/update-profile")
def update_patient_profile(profile_data: PatientProfileUpdate, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == profile_data.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        patient = db.query(Patient).filter(Patient.userID == user.userID).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")

        existing_hn = db.query(Patient).filter(
            Patient.hospital_num == profile_data.hospital_num, 
            Patient.patientID != patient.patientID 
        ).first()
        
        if existing_hn:
            raise HTTPException(
                status_code=400, 
                detail="This Hospital Number is already registered to another account. Please verify with the hospital administration."
            )
        
        try:
            formatted_dob = datetime.strptime(profile_data.dob, "%m/%d/%Y").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid Date of Birth format. Use MM/DD/YYYY.")

        patient.hospital_num = profile_data.hospital_num
        patient.contactNumber = profile_data.contactNumber
        patient.dob = formatted_dob
        patient.gender = profile_data.gender
        patient.address = profile_data.address
        
        db.commit()
        
        return {"message": "Profile completed successfully."}

    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ ERROR UPDATING PROFILE: {str(e)}\n")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")