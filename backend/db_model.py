import enum
from datetime import date, datetime, time
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Date, Time, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from db_connection import Base

# === ENUMS OPTIONS ===

class roleEnum(enum.Enum):
    Admin = "Admin"
    Staff = "Staff"
    Patient = "Patient"

class actionTypeEnum(enum.Enum):
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"

class queueStatusEnum(enum.Enum):
    Waiting = "Waiting"
    inProgress = "In Progress"
    Completed = "Completed"
    noShow = "No Show"

class weekDayEnum(enum.Enum):
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"
    Sunday = "Sunday"

# === TABLE MODELS ===

class User(Base):
    __tablename__ = "userTable"

    userID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    passwordHash: Mapped[str] = mapped_column(String(255), nullable=False) 
    role: Mapped[roleEnum] = mapped_column(SQLEnum(roleEnum), nullable=False)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True)
    createdDate: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # === Relationships ===
    patient_profile: Mapped[Optional["Patient"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")
    staff_profile: Mapped[Optional["Staff"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departmentTable"

    deptID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    department: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    referral_only: Mapped[bool] = mapped_column(Boolean, default=False)

    doctors: Mapped[List["Doctor"]] = relationship(back_populates="department")
    staff: Mapped[List["Staff"]] = relationship(back_populates="department")


class Patient(Base):
    __tablename__ = "patientTable"

    patientID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="RESTRICT"), unique=True)
    
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    middlename: Mapped[Optional[str]] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    suffix: Mapped[Optional[str]] = mapped_column(String(10))
    dob: Mapped[date] = mapped_column(Date, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text)
    contactNumber: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    hospital_num: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True) 
    emergencyContact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    emergencyContactNum: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    emergencyEmail: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # === Relationships ===
    user_account: Mapped[Optional["User"]] = relationship(back_populates="patient_profile")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="patient")


class Doctor(Base):
    __tablename__ = "doctorTable"

    docID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    deptID: Mapped[Optional[int]] = mapped_column(ForeignKey("departmentTable.deptID", ondelete="SET NULL"))
    
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    isAvailable: Mapped[bool] = mapped_column(Boolean, default=True)

    # === Relationships ===
    department: Mapped[Optional["Department"]] = relationship(back_populates="doctors")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="doctor")
    schedule: Mapped[List["Schedule"]] = relationship(back_populates="doctor")


class AppointmentStatus(Base):
    __tablename__ = "appointmentStatusTable"

    statusID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    statusName: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    statusColor: Mapped[str] = mapped_column(String(7), default="#FFFFFF")

    # === Relationship ===
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="status")


class Appointment(Base):
    __tablename__ = "appointmentTable"

    appointmentID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    patientID: Mapped[int] = mapped_column(ForeignKey("patientTable.patientID", ondelete="RESTRICT"), nullable=False)
    docID: Mapped[Optional[int]] = mapped_column(ForeignKey("doctorTable.docID", ondelete="SET NULL"))
    deptID: Mapped[int] = mapped_column(ForeignKey("departmentTable.deptID", ondelete="RESTRICT"), nullable=False)
    assignedScheduleID: Mapped[Optional[int]] = mapped_column(ForeignKey("scheduleTable.scheduleID", ondelete="SET NULL"))
    statusID: Mapped[int] = mapped_column(ForeignKey("appointmentStatusTable.statusID", ondelete="RESTRICT"), nullable=False)
     
    purposeDetailed: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[Optional[str]] = mapped_column(String(50))
    referral_doc: Mapped[Optional[str]] = mapped_column(String(255)) 
    hasPreviousRecord: Mapped[bool] = mapped_column(Boolean, default=False)
    preferredStartDate: Mapped[date] = mapped_column(Date, nullable=False)
    preferredEndDate: Mapped[Optional[date]] = mapped_column(Date)
    createdAt: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # === Relationships ===
    patient: Mapped["Patient"] = relationship(back_populates="appointments")
    doctor: Mapped[Optional["Doctor"]] = relationship(back_populates="appointments")
    assignedSchedule: Mapped[Optional["Schedule"]] = relationship(back_populates="appointments")
    department: Mapped["Department"] = relationship(back_populates="appointments")
    status: Mapped["AppointmentStatus"] = relationship(back_populates="appointments")


class Staff(Base): 
    __tablename__ = "staffTable"

    staffID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="RESTRICT"), unique=True)
    deptID: Mapped[Optional[int]] = mapped_column(ForeignKey("departmentTable.deptID", ondelete="SET NULL"))

    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[str] = mapped_column(String(100), nullable=False)

    # === Relationships ===
    user_account: Mapped[Optional["User"]] = relationship(back_populates="staff_profile")
    department: Mapped[Optional["Department"]] = relationship(back_populates="staff") 


class Schedule(Base): 
    __tablename__ = "scheduleTable"

    scheduleID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    docID: Mapped[int] = mapped_column(ForeignKey("doctorTable.docID", ondelete="CASCADE"), nullable=False)

    weekDay: Mapped[weekDayEnum] = mapped_column(SQLEnum(weekDayEnum), nullable=False) 
    startTime: Mapped[time] = mapped_column(Time, nullable=False)
    endTime: Mapped[time] = mapped_column(Time, nullable=False)
    maxPatients: Mapped[int] = mapped_column(Integer, nullable=False) # Fixed Integer syntax
    current_patient: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # === Relationships ===
    doctor: Mapped[Optional["Doctor"]] = relationship(back_populates="schedule")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="assignedSchedule") 


class SystemLogs(Base): 
    __tablename__ = "systemLogTable"
   
    logID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="SET NULL")) # Removed unique=True
    tableAffected: Mapped[str] = mapped_column(String(50), nullable=False) # Added missing field
    actionType: Mapped[actionTypeEnum] = mapped_column(SQLEnum(actionTypeEnum), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    details: Mapped[Optional[str]] = mapped_column(Text)
   

class DailyQueue(Base):
    __tablename__ = "dailyQueueTable"

    queueID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    appointmentID: Mapped[int] = mapped_column(ForeignKey("appointmentTable.appointmentID", ondelete="CASCADE"), unique=True)

    queueNum: Mapped[int] = mapped_column(Integer, nullable=False) # Removed unique=True, queue #1 happens every day
    queueStatus: Mapped[queueStatusEnum] = mapped_column(SQLEnum(queueStatusEnum), nullable=False, default=queueStatusEnum.Waiting) # Fixed default
    checkInTime: Mapped[Optional[datetime]] = mapped_column(DateTime) # Removed func.now(), check-in happens later
    consultationStart: Mapped[Optional[datetime]] = mapped_column(DateTime)
    consultationEnd: Mapped[Optional[datetime]] = mapped_column(DateTime)