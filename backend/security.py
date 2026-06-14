import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jwt.exceptions import InvalidTokenError
from db_connection import get_db
from db_model import User, SystemSettings

load_dotenv()

# === Security Configurations ===
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_for_dev_only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------
# 1. Password Hashing and Verification
# ---------------------------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# ---------------------------------------------------------
# 2. JWT Token Creation
# ---------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:

    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---------------------------------------------------------
# 3. Email Verification Token Creation
# ---------------------------------------------------------
def create_verification_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=12)
    to_encode = {"sub": email, "type": "email_verification", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---------------------------------------------------------
# 4. Get Current Logged-in User
# ---------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except InvalidTokenError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
        
    return user

# ---------------------------------------------------------
# 5. Token Verification (For SSE/WebSockets)
# ---------------------------------------------------------
def verify_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
            
        user = db.query(User).filter(User.email == email).first()
        return user
        
    except InvalidTokenError:
        return None

# ---------------------------------------------------------
# 6. Maintenance Check
# ---------------------------------------------------------
def verify_system_operational(db: Session = Depends(get_db)):
    """Middleware to enforce Maintenance Mode and Operational Hours"""
    settings = db.query(SystemSettings).first()
    if not settings:
        return True

    if settings.maintenanceMode:
        raise HTTPException(
            status_code=503, 
            detail=f"System is currently under maintenance. Reason: {settings.downtimeReason}"
        )

    try:
        now = datetime.now().time()
        start_time = datetime.strptime(settings.startTime, "%I:%M %p").time()
        end_time = datetime.strptime(settings.endTime, "%I:%M %p").time()

        if not (start_time <= now <= end_time):
            raise HTTPException(
                status_code=403, 
                detail=f"The system is currently closed. Operating hours are from {settings.startTime} to {settings.endTime}."
            )
    except Exception as e:
        print(f"Time parsing error in system guard: {e}")
        pass 

    return True

    