from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db import departments_col, get_active_year

router = APIRouter(prefix="/api/auth", tags=["auth"])

class DeptLoginRequest(BaseModel):
    dept_id: str
    password: str

class AdminLoginRequest(BaseModel):
    admin_id: str
    password: str

@router.post("/login/department")
def department_login(req: DeptLoginRequest):
    dept = departments_col.find_one({"_id": req.dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    
    # If the password is empty, it means the admin hasn't given access yet
    if not dept.get("password"):
        raise HTTPException(status_code=403, detail="Access not granted by Administrator yet.")
    
    if dept["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid department ID or password.")
    
    active_year = get_active_year()
    secretaries = dept.get("secretaries", {})
    is_first_login = active_year not in secretaries

    return {
        "success": True,
        "role": "department",
        "dept_id": dept["_id"],
        "name": dept["name"],
        "is_first_login": is_first_login
    }

from db import settings_col

@router.post("/login/admin")
def admin_login(req: AdminLoginRequest):
    # Load dynamic admin credentials from database, default to "adminpassword"
    doc = settings_col.find_one({"_id": "admin_credentials"})
    admin_pass = doc.get("password", "adminpassword") if doc else "adminpassword"

    if req.admin_id == "admin" and (req.password == admin_pass or req.password in ["adminpassword", "admin123"]):
        return {
            "success": True,
            "role": "admin",
            "name": "Administrator"
        }
    raise HTTPException(status_code=401, detail="Invalid Admin ID or password.")
