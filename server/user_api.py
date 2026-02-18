#!/usr/bin/env python3
"""
User Profile API Server
Simple JSON-based user account persistence
"""

import json
import os
import hashlib
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

# Setup paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "server" / "data"
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
PROFILES_DIR = DATA_DIR / "profiles"
PROFILES_DIR.mkdir(exist_ok=True)

app = FastAPI(title="JobHunt AI User API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class UserProfile(BaseModel):
    id: str = ""
    fullName: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedinUrl: str = ""
    githubUrl: str = ""
    portfolioUrl: str = ""
    twitterUrl: str = ""
    experienceLevel: str = "mid"
    yearsOfExperience: int = 0
    preferredRoles: List[str] = Field(default_factory=list)
    preferredIndustries: List[str] = Field(default_factory=list)
    workStyle: str = "flexible"
    salaryExpectation: Optional[int] = None
    resumeText: str = ""
    resumeFileName: str = ""
    extractedSkills: List[str] = Field(default_factory=list)
    createdAt: str = ""
    updatedAt: str = ""


class UserAccount(BaseModel):
    id: str
    email: str
    passwordHash: str  # In production, use proper auth
    createdAt: str
    lastLogin: str


class CreateAccountRequest(BaseModel):
    email: str
    password: str  # Will be hashed
    profile: UserProfile


class LoginRequest(BaseModel):
    email: str
    password: str


class SaveProfileRequest(BaseModel):
    userId: str
    profile: UserProfile


# Helper functions
def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()


def load_users() -> Dict:
    """Load users from JSON file"""
    if not USERS_FILE.exists():
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)


def save_users(users: Dict):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)


def get_profile_path(user_id: str) -> Path:
    """Get path to user profile file"""
    return PROFILES_DIR / f"{user_id}.json"


def save_user_profile(user_id: str, profile: dict):
    """Save user profile to file"""
    profile_path = get_profile_path(user_id)
    with open(profile_path, 'w') as f:
        json.dump(profile, f, indent=2)


def load_user_profile(user_id: str) -> Optional[dict]:
    """Load user profile from file"""
    profile_path = get_profile_path(user_id)
    if not profile_path.exists():
        return None
    with open(profile_path, 'r') as f:
        return json.load(f)


# API Endpoints
@app.post("/api/auth/register")
def register(request: CreateAccountRequest):
    """Register a new user account"""
    users = load_users()
    
    # Check if email already exists
    if request.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = hashlib.md5(f"{request.email}{datetime.now().isoformat()}".encode()).hexdigest()[:16]
    
    user = {
        "id": user_id,
        "email": request.email,
        "passwordHash": hash_password(request.password),
        "createdAt": datetime.now().isoformat(),
        "lastLogin": datetime.now().isoformat()
    }
    
    users[request.email] = user
    save_users(users)
    
    # Save profile
    profile_data = request.profile.dict()
    profile_data["id"] = user_id
    profile_data["createdAt"] = datetime.now().isoformat()
    profile_data["updatedAt"] = datetime.now().isoformat()
    save_user_profile(user_id, profile_data)
    
    return {
        "success": True,
        "userId": user_id,
        "message": "Account created successfully"
    }


@app.post("/api/auth/login")
def login(request: LoginRequest):
    """Login user"""
    users = load_users()
    
    if request.email not in users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users[request.email]
    
    if user["passwordHash"] != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    user["lastLogin"] = datetime.now().isoformat()
    save_users(users)
    
    # Load profile
    profile = load_user_profile(user["id"])
    
    return {
        "success": True,
        "userId": user["id"],
        "email": user["email"],
        "profile": profile
    }


@app.get("/api/profile/{user_id}")
def get_profile(user_id: str):
    """Get user profile"""
    profile = load_user_profile(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "success": True,
        "profile": profile
    }


@app.post("/api/profile/{user_id}")
def update_profile(user_id: str, profile: UserProfile):
    """Update user profile"""
    users = load_users()
    
    # Verify user exists
    user_exists = any(u["id"] == user_id for u in users.values())
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update profile
    profile_data = profile.dict()
    profile_data["id"] = user_id
    profile_data["updatedAt"] = datetime.now().isoformat()
    
    # Keep createdAt from existing profile if it exists
    existing = load_user_profile(user_id)
    if existing and "createdAt" in existing:
        profile_data["createdAt"] = existing["createdAt"]
    else:
        profile_data["createdAt"] = datetime.now().isoformat()
    
    save_user_profile(user_id, profile_data)
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "profile": profile_data
    }


@app.delete("/api/profile/{user_id}")
def delete_profile(user_id: str):
    """Delete user profile and account"""
    users = load_users()
    
    # Find and remove user
    email_to_remove = None
    for email, user in users.items():
        if user["id"] == user_id:
            email_to_remove = email
            break
    
    if email_to_remove:
        del users[email_to_remove]
        save_users(users)
    
    # Remove profile file
    profile_path = get_profile_path(user_id)
    if profile_path.exists():
        profile_path.unlink()
    
    return {
        "success": True,
        "message": "Account deleted successfully"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "users": len(load_users())
    }


# Run server
if __name__ == "__main__":
    import uvicorn
    print(f"Starting User API Server...")
    print(f"Data directory: {DATA_DIR}")
    uvicorn.run(app, host="0.0.0.0", port=8001)
