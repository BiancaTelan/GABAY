from fastapi import APIRouter, Depends
from typing import List

from dependencies import get_current_user, RoleChecker
from db_model import User, roleEnum
from py_schema import PatientResponse 

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

allow_admin_and_staff = RoleChecker([roleEnum.Admin, roleEnum.Staff])
allow_medical_team = RoleChecker([roleEnum.Admin, roleEnum.Staff])

# ---------------------------------------------------------
# ROUTE 1: Strict Access (Only Admins, Staff, and Doctors)
# ---------------------------------------------------------
@router.get("/all-schedules", dependencies=[Depends(allow_medical_team)])
def get_all_hospital_schedules():
    
    return {"message": "Secure hospital schedule data returned."}


# ---------------------------------------------------------
# ROUTE 2: General Authenticated Access (All logged-in users)
# ---------------------------------------------------------
@router.get("/my-profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
  
    return {
        "email": current_user.email,
        "role": current_user.role,
        "message": f"Welcome to the GABAY portal, your ID is {current_user.user_ID}"
    }