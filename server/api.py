"""
JobHunt AI API Server
Multi-user backend with SQLite database
"""

import hashlib
import secrets
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import jwt

from models import db, init_db

app = FastAPI(title="JobHunt AI API", version="2.0.0")

# Get allowed origins from environment or allow all for development
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    twitterUrl: Optional[str] = None
    experienceLevel: Optional[str] = None
    yearsOfExperience: Optional[int] = None
    preferredRoles: Optional[list] = None
    preferredIndustries: Optional[list] = None
    workStyle: Optional[str] = None
    salaryExpectation: Optional[int] = None
    resumeText: Optional[str] = None
    resumeFileName: Optional[str] = None
    extractedSkills: Optional[list] = None

class SaveJobRequest(BaseModel):
    job_id: str
    job_data: dict
    notes: Optional[str] = ""

class ApplicationCreate(BaseModel):
    job_id: str
    company: str
    role: str
    cover_letter: Optional[str] = ""
    email_sent: Optional[str] = ""

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    payload = {
        "user_id": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    user_id = verify_jwt(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id

# Auth endpoints
@app.post("/api/auth/register")
def register(user: UserRegister):
    existing = db.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = secrets.token_hex(16)
    password_hash = hash_password(user.password)
    
    success = db.create_user(user_id, user.email, password_hash)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    db.save_profile(user_id, {
        "fullName": user.full_name,
        "email": user.email,
        "preferredRoles": [],
        "preferredIndustries": [],
        "extractedSkills": []
    })
    
    token = create_jwt(user_id)
    
    return {
        "success": True,
        "message": "Account created successfully",
        "token": token,
        "user_id": user_id
    }

@app.post("/api/auth/login")
def login(credentials: UserLogin):
    user = db.get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    password_hash = hash_password(credentials.password)
    if password_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    db.update_last_login(user["id"])
    token = create_jwt(user["id"])
    profile = db.get_profile(user["id"])
    
    return {
        "success": True,
        "token": token,
        "user_id": user["id"],
        "email": user["email"],
        "profile": profile
    }

@app.get("/api/auth/me")
def get_me(user_id: str = Depends(get_current_user)):
    profile = db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"success": True, "user_id": user_id, "profile": profile}

# Profile endpoints
@app.get("/api/profile")
def get_profile(user_id: str = Depends(get_current_user)):
    profile = db.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"success": True, "profile": profile}

@app.put("/api/profile")
def update_profile(data: ProfileUpdate, user_id: str = Depends(get_current_user)):
    profile_data = {k: v for k, v in data.dict().items() if v is not None}
    db.save_profile(user_id, profile_data)
    return {"success": True, "message": "Profile updated"}

@app.post("/api/profile")
def create_profile(data: ProfileUpdate, user_id: str = Depends(get_current_user)):
    profile_data = data.dict()
    profile_data["createdAt"] = datetime.now().isoformat()
    db.save_profile(user_id, profile_data)
    return {"success": True, "message": "Profile saved"}

# Saved jobs endpoints
@app.post("/api/jobs/save")
def save_job(req: SaveJobRequest, user_id: str = Depends(get_current_user)):
    db.save_job(user_id, req.job_id, req.job_data, req.notes)
    return {"success": True, "message": "Job saved"}

@app.get("/api/jobs/saved")
def get_saved_jobs(user_id: str = Depends(get_current_user)):
    jobs = db.get_saved_jobs(user_id)
    return {"success": True, "jobs": jobs}

@app.delete("/api/jobs/saved/{job_id}")
def delete_saved_job(job_id: str, user_id: str = Depends(get_current_user)):
    db.delete_saved_job(user_id, job_id)
    return {"success": True, "message": "Job removed"}

# Application tracking endpoints
@app.post("/api/applications")
def create_application(app_data: ApplicationCreate, user_id: str = Depends(get_current_user)):
    app_id = db.create_application(
        user_id, app_data.job_id, app_data.company, app_data.role,
        app_data.cover_letter, app_data.email_sent
    )
    return {"success": True, "application_id": app_id}

@app.get("/api/applications")
def get_applications(user_id: str = Depends(get_current_user)):
    apps = db.get_applications(user_id)
    return {"success": True, "applications": apps}

# Health check
@app.get("/api/health")
def health():
    return {"status": "healthy", "version": "2.0.0", "timestamp": datetime.now().isoformat()}

# Run server
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting JobHunt AI API Server...")
    print(f"📁 Database: {db.db_path}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
