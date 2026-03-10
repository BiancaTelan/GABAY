from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import date, datetime
import re
from db_model import roleEnum 

# ==========================================
# REGISTRATION / SIGN-UP SCHEMAS
# ==========================================

class PatientSignUp(BaseModel):
    """Schema for handling new patient registrations from the frontend."""
    firstname: str = Field(..., min_length=2, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Must be at least 8 characters")
    confirm_password: str

    @model_validator(mode='after')
    def check_passwords_match(self) -> 'PatientSignUp':
        """Ensures the user typed the exact same password twice."""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

    @model_validator(mode='after')
    def validate_password_strength(self) -> 'PatientSignUp':
        """Enforces basic password complexity to prevent easily guessed passwords."""
        if not re.search(r"[A-Z]", self.password):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", self.password):
            raise ValueError("Password must contain at least one number.")
        return self


# ==========================================
# USER SCHEMAS (Accounts & Authentication)
# ==========================================

class UserBase(BaseModel):
    email: EmailStr
    isActive: bool = True

class UserCreate(UserBase):
    """Schema for Admins manually creating Staff or Doctor accounts."""
    password: str = Field(..., min_length=8)
    role: roleEnum

class UserResponse(UserBase):
    """Secure response schema that NEVER includes the password hash."""
    userID: int
    role: roleEnum
    createdDate: datetime

    class Config:
        from_attributes = True


# ==========================================
# PATIENT SCHEMAS (Outpatient Records)
# ==========================================

class PatientBase(BaseModel):
    """Base demographic data. birthDate is now Optional for progressive profiling."""
    firstname: str = Field(..., min_length=2, max_length=100)
    middlename: Optional[str] = Field(None, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    suffix: Optional[str] = Field(None, max_length=10)
    birthDate: Optional[date] = None 
    address: Optional[str] = None
    hasPreviousRecord: bool = False

class PatientUpdate(BaseModel):
    """Schema used when the patient later fills in their missing details to book an appointment."""
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