from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import date, datetime
import re
from db_model import roleEnum 

# ==========================================
# REGISTRATION / SIGN-UP SCHEMAS
# ==========================================

class PatientSignUp(BaseModel):
    
    firstname: str = Field(..., min_length=2, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    confirm_password: str

    @model_validator(mode='after')
    def check_passwords_match(self) -> 'PatientSignUp':
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

    @model_validator(mode='after')
    def validate_password_strength(self) -> 'PatientSignUp':
        
        if not re.search(r"[A-Z]", self.password):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", self.password):
            raise ValueError("Password must contain at least one number.")
        return self

# ===================================================
# HOSPITAL NUMBER GENERATION & REGISTRATION SCHEMAS
# ===================================================

class HospitalNumberRequest(BaseModel):
    email: EmailStr

class PatientProfileUpdate(BaseModel):
    firstname: str
    surname: str
    email: EmailStr
    hospital_num: str
    contactNumber: str
    dob: str
    gender: str
    address: str
    emergencyContact: str
    emergencyContactNum: str
    emergencyEmail: str
    
# ==========================================
# USER SCHEMAS (Accounts & Authentication)
# ==========================================

class UserBase(BaseModel):
    email: EmailStr
    isActive: bool = True

class UserCreate(UserBase):
    
    password: str = Field(..., min_length=8)
    role: roleEnum

class UserResponse(UserBase):
    
    userID: int
    role: roleEnum
    createdDate: datetime

    class Config:
        from_attributes = True

# ==========================================
# PASSWORD RESET SCHEMAS
# ==========================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr
    newPassword: str

# ==========================================
# PATIENT SCHEMAS (Outpatient Records)
# ==========================================

class PatientBase(BaseModel):
    
    firstname: str = Field(..., min_length=2, max_length=100)
    middlename: Optional[str] = Field(None, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    suffix: Optional[str] = Field(None, max_length=10)
    birthDate: Optional[date] = None 
    address: Optional[str] = None
    
class PatientUpdate(BaseModel):
    
    birthDate: date
    address: str
    middlename: Optional[str] = None
    
    @model_validator(mode='after')
    def validate_birthdate(self) -> 'PatientUpdate':
        if self.birthDate > date.today():
            raise ValueError("Birthdate cannot be in the future.")
        return self

class PatientResponse(PatientBase):
    patientID: int
    userID: Optional[int] = None
    hospital_num: Optional[str] = None

    class Config:
        from_attributes = True

# ==========================================
# CHANGE EMAIL / PASSWORD SCHEMAS
# ==========================================

class ChangeEmailRequest(BaseModel):
    current_email: EmailStr
    new_email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str

# ==========================================
# CONTACT FORM SCHEMA
# ==========================================

class ContactFormRequest(BaseModel):
    firstname: str
    surname: str
    email: str
    subject: str
    message: str