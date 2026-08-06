from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Optional
from db import departments_col, events_col, settings_col, issued_events_col, registrations_col, get_active_year

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Pydantic models for request bodies
class EventModel(BaseModel):
    id: str
    name: str
    type: str  # "solo", "team", "others"
    gender: str  # "boys" or "girls"
    other_details: Optional[str] = ""
    max_members: Optional[int] = 1
    max_registrations: Optional[int] = 3
    is_visible: Optional[bool] = True

class EventEditModel(BaseModel):
    name: str
    type: str
    gender: str
    other_details: Optional[str] = ""
    max_members: Optional[int] = 1
    max_registrations: Optional[int] = 3
    is_visible: Optional[bool] = True

class DepartmentModel(BaseModel):
    id: str
    name: str
    shift: int  # 1 or 2

class DepartmentEditModel(BaseModel):
    name: str
    shift: int

class GiveAccessModel(BaseModel):
    password: str

class RulesModel(BaseModel):
    rules: List[str]

class DeadlinesModel(BaseModel):
    common_deadline: str
    event_deadlines: Dict[str, str]

class IssueEventsModel(BaseModel):
    boys: List[str]
    girls: List[str]


# 1. Manage Events
@router.get("/events")
def list_events():
    return list(events_col.find())

@router.post("/events")
def create_event(ev: EventModel):
    # Check if event already exists
    existing = events_col.find_one({"_id": ev.id})
    if existing:
        raise HTTPException(status_code=400, detail="Event with this ID already exists.")
    
    events_col.insert_one({
        "_id": ev.id,
        "name": ev.name,
        "type": ev.type,
        "gender": ev.gender,
        "other_details": ev.other_details or "",
        "max_members": ev.max_members if ev.type in ["team", "others"] else 1,
        "max_registrations": ev.max_registrations if ev.max_registrations is not None else 3,
        "is_visible": ev.is_visible if ev.is_visible is not None else True
    })
    return {"success": True, "message": "Event added successfully."}

@router.put("/events/{event_id}")
def edit_event(event_id: str, ev: EventEditModel):
    res = events_col.update_one(
        {"_id": event_id},
        {
            "$set": {
                "name": ev.name, 
                "type": ev.type, 
                "gender": ev.gender,
                "other_details": ev.other_details or "",
                "max_members": ev.max_members if ev.type in ["team", "others"] else 1,
                "max_registrations": ev.max_registrations if ev.max_registrations is not None else 3,
                "is_visible": ev.is_visible if ev.is_visible is not None else True
            }
        }
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"success": True, "message": "Event updated successfully."}

@router.put("/events/{event_id}/visibility")
def toggle_visibility(event_id: str, is_visible: bool = Body(..., embed=True)):
    res = events_col.update_one(
        {"_id": event_id},
        {"$set": {"is_visible": is_visible}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"success": True, "message": "Event visibility updated."}

@router.delete("/events/{event_id}")
def delete_event(event_id: str):
    res = events_col.delete_one({"_id": event_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found.")
    # Clean registrations for this event
    registrations_col.delete_many({"event_id": event_id})
    # Clean from issued events
    issued_events_col.update_many({}, {"$pull": {"boys": event_id, "girls": event_id}})
    return {"success": True, "message": "Event deleted successfully."}


# 2. Manage Departments
@router.get("/departments")
def list_departments():
    return list(departments_col.find())

@router.post("/departments")
def add_department(dept: DepartmentModel):
    if departments_col.find_one({"_id": dept.id}):
        raise HTTPException(status_code=400, detail="Department ID already exists.")
    
    departments_col.insert_one({
        "_id": dept.id,
        "name": dept.name,
        "shift": dept.shift,
        "password": "",
        "is_first_login": True,
        "vice_secretary": None,
        "student_secretary": None
    })
    # Create default empty issued events list
    issued_events_col.insert_one({
        "department_id": dept.id,
        "boys": [],
        "girls": []
    })
    return {"success": True, "message": "Department added successfully."}

@router.put("/departments/{dept_id}")
def edit_department(dept_id: str, dept: DepartmentEditModel):
    res = departments_col.update_one(
        {"_id": dept_id},
        {"$set": {"name": dept.name, "shift": dept.shift}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found.")
    return {"success": True, "message": "Department updated successfully."}

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: str):
    res = departments_col.delete_one({"_id": dept_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found.")
    # Clean registrations & issued records
    registrations_col.delete_many({"department_id": dept_id})
    issued_events_col.delete_one({"department_id": dept_id})
    return {"success": True, "message": "Department deleted successfully."}


# 3. Give Access / Set Password
@router.put("/department-access/{dept_id}")
def give_access(dept_id: str, body: GiveAccessModel):
    res = departments_col.update_one(
        {"_id": dept_id},
        {"$set": {"password": body.password}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found.")
    return {"success": True, "message": "Access password updated successfully."}


# 4. Manage Rules, Deadlines & Notifications
@router.get("/rules-deadlines")
def get_rules_deadlines():
    rules_doc = settings_col.find_one({"_id": "rules"})
    deadlines_doc = settings_col.find_one({"_id": "deadlines"})
    notif_doc = settings_col.find_one({"_id": "notification"})
    return {
        "rules": rules_doc.get("rules", []) if rules_doc else [],
        "common_deadline": deadlines_doc.get("common_deadline") if deadlines_doc else None,
        "event_deadlines": deadlines_doc.get("event_deadlines", {}) if deadlines_doc else {},
        "notification": notif_doc.get("text", "") if notif_doc else ""
    }

@router.put("/rules")
def update_rules(body: RulesModel):
    settings_col.update_one(
        {"_id": "rules"},
        {"$set": {"rules": body.rules}},
        upsert=True
    )
    return {"success": True, "message": "Rules updated successfully."}

@router.put("/deadlines")
def update_deadlines(body: DeadlinesModel):
    settings_col.update_one(
        {"_id": "deadlines"},
        {
            "$set": {
                "common_deadline": body.common_deadline,
                "event_deadlines": body.event_deadlines
            }
        },
        upsert=True
    )
    return {"success": True, "message": "Deadlines updated successfully."}

@router.put("/notification")
def update_notification(text: str = Body(..., embed=True)):
    settings_col.update_one(
        {"_id": "notification"},
        {"$set": {"text": text}},
        upsert=True
    )
    return {"success": True, "message": "Notification updated successfully."}


# 5. Manage Issued Events (Fixed ObjectId serialization)
@router.get("/issued-events")
def list_issued_events():
    results = []
    for doc in issued_events_col.find():
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.put("/issued-events/{dept_id}")
def update_issued_events(dept_id: str, body: IssueEventsModel):
    res = issued_events_col.update_one(
        {"department_id": dept_id},
        {"$set": {"boys": body.boys, "girls": body.girls}},
        upsert=True
    )
    return {"success": True, "message": "Issued events updated successfully."}


# 6. Active Year Management
class ActiveYearModel(BaseModel):
    year: str

@router.get("/active-year")
def get_admin_active_year():
    return {"active_year": get_active_year()}

@router.put("/active-year")
def update_admin_active_year(body: ActiveYearModel):
    year_val = body.year.strip()
    current_year = get_active_year()
    
    settings_col.update_one(
        {"_id": "active_year"},
        {"$set": {"year": year_val}},
        upsert=True
    )
    
    # Unconditionally erase registrations and reset department secretaries first login details
    registrations_col.delete_many({})
    departments_col.update_many({}, {"$set": {"secretaries": {}}})
        
    doc = settings_col.find_one({"_id": "years_list"})
    if not doc:
        years = [year_val]
    else:
        years = doc.get("years", [])
        if year_val not in years:
            years.append(year_val)
    
    settings_col.update_one(
        {"_id": "years_list"},
        {"$set": {"years": sorted(years)}},
        upsert=True
    )
    return {"success": True, "message": f"Active year updated to {year_val} successfully."}

@router.delete("/year/{year}")
def delete_admin_year(year: str):
    active_year = get_active_year()
    if year == active_year:
        raise HTTPException(status_code=400, detail="Cannot delete the currently active year.")
        
    doc = settings_col.find_one({"_id": "years_list"})
    if doc:
        years = doc.get("years", [])
        if year in years:
            years.remove(year)
            settings_col.update_one({"_id": "years_list"}, {"$set": {"years": years}})
    return {"success": True, "message": f"Year {year} deleted successfully."}

@router.get("/years")
def get_admin_years():
    doc = settings_col.find_one({"_id": "years_list"})
    active_year = get_active_year()
    if not doc:
        years = [active_year]
        settings_col.insert_one({"_id": "years_list", "years": [active_year]})
    else:
        years = doc.get("years", [])
        if active_year not in years:
            years = sorted(years + [active_year])
            settings_col.update_one({"_id": "years_list"}, {"$set": {"years": years}})
    return {"years": years}

class AdminPasswordModel(BaseModel):
    password: str

@router.get("/admin-password")
def get_admin_password():
    doc = settings_col.find_one({"_id": "admin_credentials"})
    admin_pass = doc.get("password", "adminpassword") if doc else "adminpassword"
    return {"password": admin_pass}

@router.put("/admin-password")
def update_admin_password(body: AdminPasswordModel):
    pass_val = body.password.strip()
    if not pass_val:
        raise HTTPException(status_code=400, detail="Password cannot be empty.")
    settings_col.update_one(
        {"_id": "admin_credentials"},
        {"$set": {"password": pass_val}},
        upsert=True
    )
    return {"success": True, "message": "Admin password updated successfully."}
