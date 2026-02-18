"""
Database models for JobHunt AI
Uses SQLite for simplicity (can upgrade to PostgreSQL later)
"""

from datetime import datetime
from typing import Optional, List
import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "jobhunt.db"

def init_db():
    """Initialize database tables"""
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    """)
    
    # Profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            location TEXT,
            linkedin_url TEXT,
            github_url TEXT,
            portfolio_url TEXT,
            twitter_url TEXT,
            experience_level TEXT,
            years_of_experience INTEGER,
            preferred_roles TEXT,  -- JSON array
            preferred_industries TEXT,  -- JSON array
            work_style TEXT,
            salary_expectation INTEGER,
            resume_text TEXT,
            resume_file_name TEXT,
            extracted_skills TEXT,  -- JSON array
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Saved jobs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            job_data TEXT NOT NULL,  -- JSON
            notes TEXT,
            status TEXT DEFAULT 'saved',  -- saved, applied, interviewing, rejected, offer
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, job_id)
        )
    """)
    
    # Job applications tracking
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            cover_letter TEXT,
            email_sent TEXT,
            status TEXT DEFAULT 'draft',  -- draft, sent, phone_screen, interview, offer, rejected
            applied_at TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

class Database:
    def __init__(self):
        self.db_path = DB_PATH
    
    def get_conn(self):
        return sqlite3.connect(self.db_path)
    
    # User operations
    def create_user(self, user_id: str, email: str, password_hash: str) -> bool:
        conn = self.get_conn()
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (user_id, email.lower(), password_hash, datetime.now().isoformat())
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False  # Email already exists
        finally:
            conn.close()
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, email, password_hash, created_at, last_login FROM users WHERE email = ?",
            (email.lower(),)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "email": row[1],
                "password_hash": row[2],
                "created_at": row[3],
                "last_login": row[4]
            }
        return None
    
    def update_last_login(self, user_id: str):
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET last_login = ? WHERE id = ?",
            (datetime.now().isoformat(), user_id)
        )
        conn.commit()
        conn.close()
    
    # Profile operations
    def save_profile(self, user_id: str, profile_data: dict):
        conn = self.get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            """INSERT OR REPLACE INTO profiles 
            (user_id, full_name, email, phone, location, linkedin_url, github_url, 
            portfolio_url, twitter_url, experience_level, years_of_experience,
            preferred_roles, preferred_industries, work_style, salary_expectation,
            resume_text, resume_file_name, extracted_skills, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user_id,
                profile_data.get("fullName", ""),
                profile_data.get("email", ""),
                profile_data.get("phone", ""),
                profile_data.get("location", ""),
                profile_data.get("linkedinUrl", ""),
                profile_data.get("githubUrl", ""),
                profile_data.get("portfolioUrl", ""),
                profile_data.get("twitterUrl", ""),
                profile_data.get("experienceLevel", "mid"),
                profile_data.get("yearsOfExperience", 0),
                json.dumps(profile_data.get("preferredRoles", [])),
                json.dumps(profile_data.get("preferredIndustries", [])),
                profile_data.get("workStyle", "flexible"),
                profile_data.get("salaryExpectation"),
                profile_data.get("resumeText", ""),
                profile_data.get("resumeFileName", ""),
                json.dumps(profile_data.get("extractedSkills", [])),
                profile_data.get("createdAt", datetime.now().isoformat()),
                datetime.now().isoformat()
            )
        )
        conn.commit()
        conn.close()
    
    def get_profile(self, user_id: str) -> Optional[dict]:
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        columns = [desc[0] for desc in cursor.description]
        profile = dict(zip(columns, row))
        
        # Parse JSON fields
        profile["preferred_roles"] = json.loads(profile["preferred_roles"] or "[]")
        profile["preferred_industries"] = json.loads(profile["preferred_industries"] or "[]")
        profile["extracted_skills"] = json.loads(profile["extracted_skills"] or "[]")
        
        return profile
    
    # Saved jobs operations
    def save_job(self, user_id: str, job_id: str, job_data: dict, notes: str = ""):
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT OR REPLACE INTO saved_jobs 
            (user_id, job_id, job_data, notes, created_at)
            VALUES (?, ?, ?, ?, ?)""",
            (user_id, job_id, json.dumps(job_data), notes, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    
    def get_saved_jobs(self, user_id: str) -> List[dict]:
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT job_id, job_data, notes, status, created_at FROM saved_jobs WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        jobs = []
        for row in rows:
            job_data = json.loads(row[1])
            job_data["saved_notes"] = row[2]
            job_data["saved_status"] = row[3]
            job_data["saved_at"] = row[4]
            jobs.append(job_data)
        return jobs
    
    def delete_saved_job(self, user_id: str, job_id: str):
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?",
            (user_id, job_id)
        )
        conn.commit()
        conn.close()
    
    # Application tracking
    def create_application(self, user_id: str, job_id: str, company: str, role: str, 
                          cover_letter: str = "", email_sent: str = "") -> int:
        conn = self.get_conn()
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        cursor.execute(
            """INSERT INTO applications 
            (user_id, job_id, company, role, cover_letter, email_sent, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, job_id, company, role, cover_letter, email_sent, "draft", now, now)
        )
        app_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return app_id
    
    def get_applications(self, user_id: str) -> List[dict]:
        conn = self.get_conn()
        cursor = conn.cursor()
        cursor.execute(
            """SELECT id, job_id, company, role, status, applied_at, notes, created_at 
            FROM applications WHERE user_id = ? ORDER BY created_at DESC""",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        apps = []
        for row in rows:
            apps.append({
                "id": row[0],
                "job_id": row[1],
                "company": row[2],
                "role": row[3],
                "status": row[4],
                "applied_at": row[5],
                "notes": row[6],
                "created_at": row[7]
            })
        return apps

# Initialize on import
init_db()
db = Database()
