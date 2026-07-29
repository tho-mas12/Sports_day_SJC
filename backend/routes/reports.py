from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from db import registrations_col, departments_col, events_col, get_active_year
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["reports"])

class FilterRequest(BaseModel):
    shifts: Optional[List[int]] = None
    departments: Optional[List[str]] = None
    genders: Optional[List[str]] = None
    events: Optional[List[str]] = None
    years: Optional[List[str]] = None

@router.post("/filter")
def filter_registrations(req: FilterRequest):
    # Load metadata maps
    depts = {d["_id"]: d for d in departments_col.find()}
    events = {e["_id"]: e for e in events_col.find()}
    
    regs = list(registrations_col.find())
    
    # Flatten registrations to individual participant records
    flat_records = []
    for r in regs:
        dept_id = r["department_id"]
        event_id = r["event_id"]
        
        dept = depts.get(dept_id, {"name": "Unknown Dept", "shift": 0})
        event = events.get(event_id, {"name": "Unknown Event", "gender": "both"})
        
        created_at_str = r.get("created_at", datetime.utcnow().isoformat())
        reg_year = created_at_str[:4]  # Extract year e.g. "2026"
        
        if r["type"] == "solo":
            flat_records.append({
                "student_id": r.get("student_id"),
                "student_name": r.get("student_name"),
                "dept_id": dept_id,
                "dept_name": dept["name"],
                "shift": dept["shift"],
                "gender": r.get("gender", "male").lower(),
                "event_id": event_id,
                "event_name": event["name"],
                "event_type": "solo",
                "role": "Soloist",
                "year": reg_year,
                "date": created_at_str[:10]
            })
        elif r["type"] == "team":
            # Add Team Leader
            leader = r.get("team_leader", {})
            if leader:
                flat_records.append({
                    "student_id": leader.get("dept_num"),
                    "student_name": leader.get("name"),
                    "dept_id": dept_id,
                    "dept_name": dept["name"],
                    "shift": dept["shift"],
                    # Leader gender is usually matching the event gender or check
                    "gender": "male" if event["gender"] == "boys" else "female",
                    "event_id": event_id,
                    "event_name": event["name"],
                    "event_type": "team",
                    "role": "Team Leader",
                    "year": reg_year,
                    "date": created_at_str[:10]
                })
            # Add Team Members
            for m in r.get("members", []):
                flat_records.append({
                    "student_id": m.get("dept_num"),
                    "student_name": m.get("name"),
                    "dept_id": dept_id,
                    "dept_name": dept["name"],
                    "shift": dept["shift"],
                    "gender": m.get("gender", "male").lower(),
                    "event_id": event_id,
                    "event_name": event["name"],
                    "event_type": "team",
                    "role": "Team Member",
                    "year": reg_year,
                    "date": created_at_str[:10]
                })

    # Apply Filters
    filtered = []
    unique_filtered_students = set()
    
    for rec in flat_records:
        # Check Year
        if req.years and rec["year"] not in req.years:
            continue
        # Check Shift
        if req.shifts and rec["shift"] not in req.shifts:
            continue
        # Check Department
        if req.departments and rec["dept_id"] not in req.departments:
            continue
        # Check Gender
        if req.genders and rec["gender"] not in req.genders:
            continue
        # Check Event
        if req.events and rec["event_id"] not in req.events:
            continue
            
        filtered.append(rec)
        if rec["student_id"]:
            unique_filtered_students.add(rec["student_id"])

    # Extract all available Years and Dates for filters dropdowns in UI
    available_years = list(set(rec["year"] for rec in flat_records))
    
    # Calculate unique student count (total participation count without duplicates)
    total_unique_count = len(unique_filtered_students)

    return {
        "records": filtered,
        "total_unique_count": total_unique_count,
        "available_years": sorted(available_years)
    }

@router.get("/secretaries")
def get_secretaries_list():
    depts = list(departments_col.find())
    res = []
    active_year = get_active_year()
    for d in depts:
        sec_details = d.get("secretaries", {}).get(active_year, {})
        res.append({
            "dept_id": d["_id"],
            "dept_name": d["name"],
            "shift": d["shift"],
            "vice_secretary": sec_details.get("vice_secretary"),
            "student_secretary": sec_details.get("student_secretary")
        })
    return res
