from jose import JWTError
import jwt
import random
from fastapi import BackgroundTasks
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
from db_connection import get_db
from db_model import User, Patient, roleEnum
from py_schema import PatientSignUp, ForgotPasswordRequest, ResetPasswordOTPRequest, VerifyOTPRequest, ChangeEmailRequest, ChangePasswordRequest
from security import create_verification_token, verify_password, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from email_utils import send_notification_email, send_otp_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["Authentication & Registration"])

# ---------------------------------------------------------
# 1. LOGIN ROUTE
# ---------------------------------------------------------
@router.post("/login", summary="Create access token for user")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    
    print("\n" + "="*30)
    print(f"--- INCOMING LOGIN ATTEMPT ---")
    print(f"Email received: [{form_data.username}]")
    print(f"Password received: [{form_data.password}]")
    
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        print("❌ RESULT: Email NOT FOUND in database.")
    else:
        print("✅ RESULT: Email found! Checking password...")
        is_valid = verify_password(form_data.password, user.passwordHash)
        print(f"❌ Password Valid? {is_valid}")
        print(f"✅ Is Active? {user.isActive}")
    print("="*30 + "\n")
    
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
def register_patient(background_tasks: BackgroundTasks, patient_data: PatientSignUp, db: Session = Depends(get_db)):
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

        verification_token = create_verification_token(new_user.email)
        
        background_tasks.add_task(
        send_verification_email, 
        recipient_email=new_user.email, 
        token=verification_token
        )

        return {"message": "Account created successfully. Please check your email to verify your account. Logging you in"}

    except HTTPException:
        raise 
        
    except Exception as e:
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
def forgot_password(
    request: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        otp = str(random.randint(100000, 999999))
        
        OTP_STORE[request.email] = otp

        background_tasks.add_task(
            send_otp_email,
            recipient_email=request.email,
            otp=otp
        )
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
# 5. CHANGE PASSWORD
# ---------------------------------------------------------
@router.put("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db)):
   
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.current_password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect current password.")
        
    user.passwordHash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully."}

# ---------------------------------------------------------
# 7. EMAIL VERIFICATION
# ---------------------------------------------------------
@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")

        if email is None or token_type != "email_verification":
            raise HTTPException(status_code=400, detail="Invalid verification token.")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        if user.is_verified:
            return {"message": "Email is already verified!"}

        user.is_verified = True
        db.commit()

        return {"message": "Email verified successfully! You can now log in."}

    except JWTError:
        raise HTTPException(status_code=400, detail="Token is invalid or has expired.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))