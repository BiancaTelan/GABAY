from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from db_connection import get_db
from db_model import User, Patient
from py_schema import HospitalNumberRequest

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
                "hospitalNumber": patient.hospital_num
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
            "hospitalNumber": new_hospital_number
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ ERROR GENERATING ID: {str(e)}\n")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")