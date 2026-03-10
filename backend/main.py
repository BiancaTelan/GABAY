from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db_connection import engine
import db_model 
import user_auth
from routers import appointments 

db_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GABAY System API",
    description="Backend for the Cainta Municipal Hospital Outpatient Reservation System",
    version="1.0.0"
)
origins = [
    "http://localhost:5173",     
    "http://127.0.0.1:5173",
    # "https://gabay-system.com" # Add your actual production domain here later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(user_auth.router)
app.include_router(appointments.router)

@app.get("/", tags=["Health"])
def root():
    return {"message": "GABAY System API is running successfully."}