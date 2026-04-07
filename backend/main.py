from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db_connection import engine
import db_model 
import user_auth
from routers import appointments 
from routers import patients

db_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GABAY System API",
    description="Backend for the Cainta Municipal Hospital Outpatient Reservation System",
    version="1.0.0"
)
origins = [
    # --- PATIENT PORTAL URLS ---
    "http://localhost:5173",     
    "http://127.0.0.1:5173",
    "https://gabay-system.vercel.app",
   
    # --- ADMIN PORTAL URLS ---
    "http://localhost:5174",     
    "http://127.0.0.1:5174"
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

@app.get("/", tags=["Health"])
def root():
    return {"message": "GABAY System API is running successfully."}