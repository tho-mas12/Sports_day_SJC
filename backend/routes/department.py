from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import departments_col, issued_events_col, registrations_col, events_col, settings_col, get_active_year
from datetime import datetime

router = APIRouter(prefix="/api/department", tags=["department"])

class SecretaryDetails(BaseModel):
    vice_name: str
    vice_phone: str
    student_name: str
    student_phone: str

@router.get("/{dept_id}/profile")
def get_profile(dept_id: str):
    dept = departments_col.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    active_year = get_active_year()
    secretaries = dept.get("secretaries", {})
    sec_details = secretaries.get(active_year, {})
    return {
        "dept_id": dept["_id"],
        "name": dept["name"],
        "shift": dept["shift"],
        "is_first_login": active_year not in secretaries,
        "vice_secretary": sec_details.get("vice_secretary"),
        "student_secretary": sec_details.get("student_secretary")
    }

@router.post("/{dept_id}/first-login")
def first_login_setup(dept_id: str, sec: SecretaryDetails):
    dept = departments_col.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
        
    # Mobile number length validation
    v_phone = sec.vice_phone.strip()
    s_phone = sec.student_phone.strip()
    if not (v_phone.isdigit() and len(v_phone) == 10):
        raise HTTPException(status_code=400, detail="Staff Secretary mobile number must be exactly 10 digits.")
    if not (s_phone.isdigit() and len(s_phone) == 10):
        raise HTTPException(status_code=400, detail="Student Secretary mobile number must be exactly 10 digits.")

    active_year = get_active_year()
    departments_col.update_one(
        {"_id": dept_id},
        {
            "$set": {
                f"secretaries.{active_year}": {
                    "vice_secretary": {"name": sec.vice_name.strip(), "phone": v_phone},
                    "student_secretary": {"name": sec.student_name.strip(), "phone": s_phone}
                }
            }
        }
    )
    return {"success": True, "message": "Secretary details saved successfully."}

@router.put("/{dept_id}/profile")
def update_profile(dept_id: str, sec: SecretaryDetails):
    dept = departments_col.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
        
    # Mobile number length validation
    v_phone = sec.vice_phone.strip()
    s_phone = sec.student_phone.strip()
    if not (v_phone.isdigit() and len(v_phone) == 10):
        raise HTTPException(status_code=400, detail="Staff Secretary mobile number must be exactly 10 digits.")
    if not (s_phone.isdigit() and len(s_phone) == 10):
        raise HTTPException(status_code=400, detail="Student Secretary mobile number must be exactly 10 digits.")

    active_year = get_active_year()
    departments_col.update_one(
        {"_id": dept_id},
        {
            "$set": {
                f"secretaries.{active_year}": {
                    "vice_secretary": {"name": sec.vice_name.strip(), "phone": v_phone},
                    "student_secretary": {"name": sec.student_name.strip(), "phone": s_phone}
                }
            }
        }
    )
    return {"success": True, "message": "Profile updated successfully."}

@router.get("/{dept_id}/dashboard")
def get_dashboard_data(dept_id: str):
    dept = departments_col.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    secretaries = dept.get("secretaries", {})
    
    # Get issued events for this department
    issued = issued_events_col.find_one({"department_id": dept_id})
    if not issued:
        allowed_event_ids = []
    else:
        allowed_event_ids = list(set(issued.get("boys", []) + issued.get("girls", [])))

    # Get details for all these allowed events, excluding hidden ones
    allowed_events = list(events_col.find({
        "_id": {"$in": allowed_event_ids},
        "is_visible": {"$ne": False}
    }))
    
    active_year = get_active_year()
    # Get registrations for this department
    regs = list(registrations_col.find({"department_id": dept_id, "year": active_year}))
    registered_event_ids = [r["event_id"] for r in regs]
    
    registered_count = len(set(registered_event_ids))
    allowed_count = len(allowed_events)

    # Calculate Total Unique Participation
    unique_students = set()
    for r in regs:
        if r["type"] == "solo" or r.get("student_id"):
            if r.get("student_id"):
                unique_students.add(r["student_id"])
        else: # team or others
            if r.get("team_leader", {}).get("dept_num"):
                unique_students.add(r["team_leader"]["dept_num"])
            for m in r.get("members", []):
                if m.get("dept_num"):
                    unique_students.add(m["dept_num"])

    total_participation = len(unique_students)

    # Categorize events
    solo_events = []
    team_events = []
    for ev in allowed_events:
        is_reg = ev["_id"] in registered_event_ids
        
        # If type is "others" and max_members is 1, treat as solo; if > 1, treat as team
        ev_type_group = ev["type"]
        if ev["type"] == "others":
            ev_type_group = "solo" if ev.get("max_members", 1) <= 1 else "team"
            
        ev_data = {
            "id": ev["_id"],
            "name": ev["name"],
            "type": ev["type"],
            "max_members": ev.get("max_members", 1),
            "gender": ev["gender"],
            "registered": is_reg,
            "other_details": ev.get("other_details", "")
        }
        
        if ev_type_group == "solo":
            solo_events.append(ev_data)
        else:
            team_events.append(ev_data)

    # Fetch Rules and Deadlines
    rules_doc = settings_col.find_one({"_id": "rules"})
    deadlines_doc = settings_col.find_one({"_id": "deadlines"})
    notif_doc = settings_col.find_one({"_id": "notification"})

    rules = rules_doc.get("rules", []) if rules_doc else []
    notification = notif_doc.get("text", "") if notif_doc else ""
    
    common_deadline = None
    event_deadlines = {}
    if deadlines_doc:
        common_deadline = deadlines_doc.get("common_deadline")
        event_deadlines = deadlines_doc.get("event_deadlines", {})

    return {
        "dept_name": dept["name"],
        "shift": dept["shift"],
        "allowed_count": allowed_count,
        "registered_count": registered_count,
        "total_participation": total_participation,
        "solo_events": solo_events,
        "team_events": team_events,
        "rules": rules,
        "common_deadline": common_deadline,
        "event_deadlines": event_deadlines,
        "notification": notification,
        "is_first_login": active_year not in secretaries
    }

class ChangePasswordModel(BaseModel):
    new_password: str

@router.put("/{dept_id}/password")
def change_password(dept_id: str, body: ChangePasswordModel):
    dept = departments_col.find_one({"_id": dept_id})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    departments_col.update_one(
        {"_id": dept_id},
        {"$set": {"password": body.new_password}}
    )
    return {"success": True, "message": "Password updated successfully."}
