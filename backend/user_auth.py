from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta

from db_connection import get_db
from db_model import User, Patient, roleEnum
from py_schema import PatientSignUp
from security import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication & Registration"])

# ---------------------------------------------------------
# 1. LOGIN ROUTE
# ---------------------------------------------------------

@router.post("/login", summary="Create access token for user")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account has been deactivated."
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_payload = {
        "sub": user.email, 
        "role": user.role.value 
    }
    
    access_token = create_access_token(
        data=token_payload, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

# ---------------------------------------------------------
# 2. SIGN-UP ROUTE
# ---------------------------------------------------------
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def register_patient(patient_data: PatientSignUp, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == patient_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )

        hashed_password = get_password_hash(patient_data.password) 
        
        new_user = User(
            email=patient_data.email,
            passwordHash=hashed_password,
            role=roleEnum.Patient,
            isActive=True
        )

        db.add(new_user)
        db.flush() 
        
        new_patient = Patient(
            userID=new_user.userID,
            firstname=patient_data.firstname,
            surname=patient_data.surname
        )
        db.add(new_patient)
        
        db.commit()

        return {"message": "Account created successfully. You can now log in."}

    except HTTPException:
        raise 
        
    except Exception as e:
        print(f"\n❌ FATAL BACKEND ERROR: {str(e)}\n")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )
    