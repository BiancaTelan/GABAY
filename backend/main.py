import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import staff
from routers import admin
from db_connection import engine
import db_model 
import user_auth
from routers import appointments 
from routers import patients
from apscheduler.schedulers.background import BackgroundScheduler
from db_connection import SessionLocal 
from db_model import SystemHealthLog
import psutil

db_model.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="GABAY System API",
    description="Backend for the Cainta Municipal Hospital Outpatient Reservation System",
    version="1.0.0"
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def start_monitoring():
    scheduler = BackgroundScheduler()
    scheduler.add_job(automated_health_check, 'interval', minutes=60)
    scheduler.start()
    print("System Health Monitor activated. Checking hardware every hour.")

# ---------------------------------------------------------
# AUTOMATED HEALTH MONITOR
# ---------------------------------------------------------
def automated_health_check():
    """Runs in the background. Logs issues to the database if thresholds are breached."""
    db = SessionLocal() 
    
    try:
        # Check CPU
        cpu_usage = psutil.cpu_percent(interval=1)
        if cpu_usage > 90:
            cpu_log = SystemHealthLog(
                issueType="Performance",
                module="CPU Core",
                priority="HIGH",
                description=f"Sustained CPU usage detected at {cpu_usage}%.",
                recommendedAction="Check for zombie processes or upgrade server tier."
            )
            db.add(cpu_log)

        # Check Storage
        disk = psutil.disk_usage('/')
        if disk.percent > 90:
            disk_log = SystemHealthLog(
                issueType="Storage",
                module="Root Directory",
                priority="CRITICAL",
                description=f"Storage capacity critically low: {disk.percent}% used.",
                recommendedAction="Clear temporary files and expand volume storage."
            )
            db.add(disk_log)

        # Check RAM
        ram = psutil.virtual_memory()
        if ram.percent > 95:
            ram_log = SystemHealthLog(
                issueType="Memory",
                module="RAM Allocation",
                priority="HIGH",
                description=f"System memory nearly exhausted: {ram.percent}% used.",
                recommendedAction="Restart secondary worker nodes to clear memory leaks."
            )
            db.add(ram_log)

        db.commit()
        
    except Exception as e:
        print(f"Health Check Failed: {e}")
    finally:
        db.close()

origins = [
    # --- PATIENT PORTAL URLS ---
    "http://localhost:5173",     
    "http://127.0.0.1:5173",
    "https://gabay-system.vercel.app",
   
    # --- ADMIN PORTAL URLS ---
    "http://localhost:5174",     
    "http://127.0.0.1:5174",
    "https://gabay-systempersonnel.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(user_auth.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(staff.router, prefix="/api")

@app.get("/", tags=["Health"])
def root():
    return {"message": "GABAY System API is running successfully."}

