import enum
from datetime import date, datetime, time
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime, Date, Time, Text, Enum as SQLEnum, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from db_connection import Base

# === ASSOCIATION TABLES ===
staff_department_assoc = Table(
    "staff_department_assoc",
    Base.metadata,
    Column("staffID", Integer, ForeignKey("staffTable.staffID", ondelete="CASCADE"), primary_key=True),
    Column("deptID", Integer, ForeignKey("departmentTable.deptID", ondelete="CASCADE"), primary_key=True)
)

# === ENUMS OPTIONS ===
class EventTypeEnum(enum.Enum):
    EVENT = "EVENT"
    HOLIDAY = "HOLIDAY"

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
    APPROVE = "APPROVE"
    RESCHEDULE = "RESCHEDULE"
    DENY = "DENY"
    BOOK = "BOOK"
    ERROR = "ERROR"
    WARNING = "WARNING"

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
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # === Relationships ===
    patient_profile: Mapped[Optional["Patient"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")
    staff_profile: Mapped[Optional["Staff"]] = relationship(back_populates="user_account", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departmentTable"

    deptID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    department: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    doctors: Mapped[List["Doctor"]] = relationship(back_populates="department")
    staff: Mapped[List["Staff"]] = relationship(back_populates="department")
    slotCapacity: Mapped[int] = mapped_column(Integer, default=25)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True)

    # === Relationship ===
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="department")
    doctors: Mapped[list["Doctor"]] = relationship(back_populates="department")
    staff: Mapped[List["Staff"]] = relationship(secondary=staff_department_assoc, back_populates="departments")

class Patient(Base):
    __tablename__ = "patientTable"

    patientID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="CASCADE"), unique=True)
    
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    middlename: Mapped[Optional[str]] = mapped_column(String(100))
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    suffix: Mapped[Optional[str]] = mapped_column(String(10))
    dob: Mapped[date] = mapped_column(Date, nullable=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    civilStatus: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text)
    contactNumber: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    hospital_num: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True) 
    emergencyContact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    emergencyContactNum: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    emergencyEmail: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # === Relationships ===
    user_account: Mapped[Optional["User"]] = relationship(back_populates="patient_profile")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="patient", cascade="all, delete-orphan")


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
    patientID: Mapped[int] = mapped_column(ForeignKey("patientTable.patientID", ondelete="CASCADE"), nullable=False)
    docID: Mapped[Optional[int]] = mapped_column(ForeignKey("doctorTable.docID", ondelete="SET NULL"))
    deptID: Mapped[int] = mapped_column(ForeignKey("departmentTable.deptID", ondelete="RESTRICT"), nullable=False)
    assignedScheduleID: Mapped[Optional[int]] = mapped_column(ForeignKey("scheduleTable.scheduleID", ondelete="SET NULL"))
    assignedDate: Mapped[Optional[date]] = mapped_column(Date)
    statusID: Mapped[int] = mapped_column(ForeignKey("appointmentStatusTable.statusID", ondelete="RESTRICT"), nullable=False)
    purposeDetailed: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[Optional[str]] = mapped_column(String(50))
    referral_doc: Mapped[Optional[str]] = mapped_column(String(255)) 
    hasPreviousRecord: Mapped[bool] = mapped_column(Boolean, default=False)
    preferredStartDate: Mapped[date] = mapped_column(Date, nullable=False)
    preferredEndDate: Mapped[Optional[date]] = mapped_column(Date)
    createdAt: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    actionBy_userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="SET NULL"))
    actionReason: Mapped[Optional[str]] = mapped_column(Text)
    actionDate: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # === Relationships ===
    patient: Mapped["Patient"] = relationship(back_populates="appointments")
    doctor: Mapped[Optional["Doctor"]] = relationship(back_populates="appointments")
    assignedSchedule: Mapped[Optional["Schedule"]] = relationship(back_populates="appointments")
    department: Mapped["Department"] = relationship(back_populates="appointments")
    status: Mapped["AppointmentStatus"] = relationship(back_populates="appointments")
    department: Mapped["Department"] = relationship(back_populates="appointments")
    action_by_user: Mapped[Optional["User"]] = relationship(foreign_keys=[actionBy_userID])


class Staff(Base): 
    __tablename__ = "staffTable"

    staffID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="RESTRICT"), unique=True)
    firstname: Mapped[str] = mapped_column(String(100), nullable=False)
    middlename: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[str] = mapped_column(String(100), nullable=False)
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    contactNumber: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    workingDays: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    workingHours: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    profilePhoto: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    suffix: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # === Relationships ===
    user_account: Mapped[Optional["User"]] = relationship(back_populates="staff_profile")
    departments: Mapped[List["Department"]] = relationship(secondary=staff_department_assoc, back_populates="staff")


class Schedule(Base): 
    __tablename__ = "scheduleTable"

    scheduleID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    docID: Mapped[int] = mapped_column(ForeignKey("doctorTable.docID", ondelete="CASCADE"), nullable=False)

    weekDay: Mapped[weekDayEnum] = mapped_column(SQLEnum(weekDayEnum), nullable=False) 
    startTime: Mapped[time] = mapped_column(Time, nullable=False)
    endTime: Mapped[time] = mapped_column(Time, nullable=False)
    maxPatients: Mapped[int] = mapped_column(Integer, nullable=False) 
    
    # === Relationships ===
    doctor: Mapped[Optional["Doctor"]] = relationship(back_populates="schedule")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="assignedSchedule") 


class SystemLogs(Base): 
    __tablename__ = "systemLogTable"
   
    logID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    userID: Mapped[Optional[int]] = mapped_column(ForeignKey("userTable.userID", ondelete="SET NULL")) 
    tableAffected: Mapped[str] = mapped_column(String(50), nullable=False) 
    actionType: Mapped[actionTypeEnum] = mapped_column(SQLEnum(actionTypeEnum), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.convert_tz(func.now(), '+00:00', '+08:00'))
    details: Mapped[Optional[str]] = mapped_column(Text)
    ipAddress: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    
    # === Relationships ===
    user: Mapped[Optional["User"]] = relationship()
   

class DailyQueue(Base):
    __tablename__ = "dailyQueueTable"

    queueID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    appointmentID: Mapped[int] = mapped_column(ForeignKey("appointmentTable.appointmentID", ondelete="CASCADE"), unique=True)

    queueNum: Mapped[int] = mapped_column(Integer, nullable=False)
    queueStatus: Mapped[queueStatusEnum] = mapped_column(SQLEnum(queueStatusEnum), nullable=False, default=queueStatusEnum.Waiting) 
    checkInTime: Mapped[Optional[datetime]] = mapped_column(DateTime) 
    consultationStart: Mapped[Optional[datetime]] = mapped_column(DateTime)
    consultationEnd: Mapped[Optional[datetime]] = mapped_column(DateTime)

class SystemHealthLog(Base):
    __tablename__ = "systemHealthLogTable"
    
    logID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    issueType: Mapped[str] = mapped_column(String(50), nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendedAction: Mapped[str] = mapped_column(Text, nullable=False)

class SystemSettings(Base):
    __tablename__ = "systemSettingsTable"

    settingID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    startTime: Mapped[str] = mapped_column(String(20), default="08:00 AM")
    endTime: Mapped[str] = mapped_column(String(20), default="05:00 PM")
    retentionValue: Mapped[str] = mapped_column(String(10), default="3")
    retentionUnit: Mapped[str] = mapped_column(String(20), default="years")
    autoBackup: Mapped[bool] = mapped_column(Boolean, default=False)
    backupFrequency: Mapped[str] = mapped_column(String(50), default="Weekly")
    backupTime: Mapped[str] = mapped_column(String(20), default="12:00 AM")
    maintenanceMode: Mapped[bool] = mapped_column(Boolean, default=False)
    downtimeReason: Mapped[str] = mapped_column(String(100), default="Maintenance Mode")
    resumeTimer: Mapped[str] = mapped_column(String(20), default="60")

class CalendarEvent(Base):
    __tablename__ = "calendarEvents"

    eventID: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    type: Mapped[EventTypeEnum] = mapped_column(SQLEnum(EventTypeEnum), nullable=False)  