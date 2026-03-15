import jwt
import random
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
from db_connection import get_db
from db_model import User, Patient, roleEnum
from py_schema import PatientSignUp, ForgotPasswordRequest, ResetPasswordOTPRequest, VerifyOTPRequest, ChangeEmailRequest, ChangePasswordRequest
from security import verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM

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

        return {"message": "Account created successfully. Logging you in"}

    except HTTPException:
        raise 
        
    except Exception as e:
        print(f"\n❌ FATAL BACKEND ERROR: {str(e)}\n")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )

# ---------------------------------------------------------
# 3. FORGOT PASSWORD
# ---------------------------------------------------------

OTP_STORE = {}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        otp = str(random.randint(100000, 999999))
        
        OTP_STORE[request.email] = otp
        
        # PRINT TO THE TERMINAL
        print("\n" + "="*50)
        print("🚨 GABAY OTP REQUESTED 🚨")
        print(f"For User: {request.email}")
        print(f"Your 6-digit Verification Code is: {otp}")
        print("="*50 + "\n")

    return {"message": "If that email is registered, an OTP has been sent."}


@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    stored_otp = OTP_STORE.get(request.email)
    
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    return {"message": "OTP verified successfully."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordOTPRequest, db: Session = Depends(get_db)):
    
    if request.email not in OTP_STORE:
        raise HTTPException(status_code=400, detail="Please verify your OTP first.")
        
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    
    hashed_password = get_password_hash(request.newPassword)
    user.passwordHash = hashed_password
    db.commit()
    
    del OTP_STORE[request.email]
    
    return {"message": "Password updated successfully."}

# ---------------------------------------------------------
# 5. CHANGE EMAIL
# ---------------------------------------------------------
@router.put("/change-email")
def change_email(request: ChangeEmailRequest, db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == request.current_email).first()
    if not user or not verify_password(request.password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect password.")
        
    
    existing_user = db.query(User).filter(User.email == request.new_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="That email is already in use.")
        
    
    user.email = request.new_email
    db.commit()
    
    return {"message": "Email updated successfully."}

# ---------------------------------------------------------
# 6. CHANGE PASSWORD
# ---------------------------------------------------------
@router.put("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db)):
   
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.current_password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect current password.")
        
    user.passwordHash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully."}