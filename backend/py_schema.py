from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import date, datetime
import re
from .db_model import RoleEnum # Importing the Enum we created earlier

# ==========================================
# USER SCHEMAS (Authentication & Accounts)
# ==========================================

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="A valid email address")
    isActive: bool = True

class UserCreate(UserBase):
    # Enforce strong passwords at the API boundary
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    role: RoleEnum

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number.")
        return v

class UserResponse(UserBase):
    user_ID: int
    role: RoleEnum
    createdDate: datetime

    class Config:
        # This tells Pydantic to read data from SQLAlchemy ORM models
        from_attributes = True


# ==========================================
# PATIENT SCHEMAS (Outpatient Records)
# ==========================================

class PatientBase(BaseModel):
    firstname: str = Field(..., min_length=2, max_length=100)
    middlename: Optional[str] = Field(None, max_length=100)
    surname: str = Field(..., min_length=2, max_length=100)
    suffix: Optional[str] = Field(None, max_length=10)
    birthDate: date
    address: Optional[str] = None
    hasPreviousRecord: bool = False

class PatientCreate(PatientBase):
    
    @field_validator('birthDate')
    @classmethod
    def validate_birthdate(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Birthdate cannot be in the future.")
        return v

class PatientResponse(PatientBase):
    patient_ID: int
    user_ID: Optional[int] = None
    hospital_num: Optional[str] = None

    class Config:
        from_attributes = True