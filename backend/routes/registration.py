from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
from db import registrations_col, events_col, settings_col, departments_col, get_active_year
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/registration", tags=["registration"])

class TeamMember(BaseModel):
    name: str
    dept_num: str
    gender: str

class TeamLeader(BaseModel):
    name: str
    dept_num: str

class RegistrationRequest(BaseModel):
    event_id: str
    department_id: str
    type: str  # "solo", "team", "others"
    student_id: Optional[str] = None  # for solo or single-member events
    student_name: Optional[str] = None  # for solo or single-member events
    gender: Optional[str] = None  # "male" or "female"
    team_leader: Optional[TeamLeader] = None  # for team/others
    members: Optional[List[TeamMember]] = None  # for team/others

def is_deadline_passed(event_id: str) -> bool:
    deadlines_doc = settings_col.find_one({"_id": "deadlines"})
    if not deadlines_doc:
        return False
    
    event_deadlines = deadlines_doc.get("event_deadlines", {})
    deadline_str = event_deadlines.get(event_id) or deadlines_doc.get("common_deadline")
    
    if not deadline_str:
        return False
        
    try:
        deadline = datetime.fromisoformat(deadline_str)
        return datetime.utcnow() > deadline
    except Exception:
        return False

def check_athlete_event_count(student_id: str, current_reg_id: str = None) -> int:
    active_year = get_active_year()
    count = 0
    regs = list(registrations_col.find({"year": active_year}))
    for r in regs:
        if current_reg_id and r["_id"] == current_reg_id:
            continue
        if r["type"] in ["solo"] or r.get("student_id"):
            if r.get("student_id") == student_id:
                count += 1
        else: # team or others with rosters
            if r.get("team_leader", {}).get("dept_num") == student_id:
                count += 1
            else:
                for m in r.get("members", []):
                    if m.get("dept_num") == student_id:
                        count += 1
                        break
    return count

def is_excepted_event(event_name: str) -> bool:
    name_clean = event_name.lower().replace("mts", "mts.").replace("  ", " ").strip()
    exceptions = ["800 mts. race", "1500 mts. race", "5000 mts. race", "10,000 mts. race", "20 km walk", "800 mts race", "1500 mts race", "5000 mts race", "10000 mts race", "20km walk"]
    return any(ex in name_clean for ex in exceptions)

@router.get("/{dept_id}")
def get_department_registrations(dept_id: str):
    active_year = get_active_year()
    regs = list(registrations_col.find({"department_id": dept_id, "year": active_year}))
    
    # Batch load all events into memory to resolve N+1 latency
    events_map = {e["_id"]: e for e in events_col.find()}
    
    result = []
    for r in regs:
        event = events_map.get(r["event_id"])
        result.append({
            "registration_id": r["_id"],
            "event_id": r["event_id"],
            "event_name": event["name"] if event else "Unknown Event",
            "type": r["type"],
            "max_members": event.get("max_members", 1) if event else 1,
            "student_id": r.get("student_id"),
            "student_name": r.get("student_name"),
            "gender": r.get("gender"),
            "team_leader": r.get("team_leader"),
            "members": r.get("members")
        })
    return result

@router.post("/register")
def create_registration(req: RegistrationRequest):
    event = events_col.find_one({"_id": req.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    # 0. Check event visibility
    if event.get("is_visible") is False:
        raise HTTPException(status_code=400, detail="This event is hidden by the Admin and cannot be registered.")

    # 1. Check Deadline
    if is_deadline_passed(req.event_id):
        raise HTTPException(status_code=400, detail="Registration deadline has passed for this event.")

    active_year = get_active_year()
    max_members = event.get("max_members", 1)

    # 2. Check Event Type constraints
    # If the event has max_members == 1, treat as solo
    if req.type == "solo" or max_members <= 1:
        if not req.student_id or not req.student_name or not req.gender:
            raise HTTPException(status_code=400, detail="Student ID, Name, and Gender are required.")
        
        student_id = req.student_id.strip()
        
        # Prevent registering the same student twice for the same event
        already_registered = registrations_col.find_one({
            "event_id": req.event_id,
            "student_id": student_id,
            "year": active_year
        })
        if already_registered:
            raise HTTPException(
                status_code=400,
                detail=f"Student '{student_id}' is already registered for this event."
            )

        # Rule 1: Max athletes per department in this event (configurable limit)
        limit = event.get("max_registrations")
        if limit is None:
            limit = 9999 if is_excepted_event(event["name"]) else 3
            
        existing_count = registrations_col.count_documents({
            "event_id": req.event_id,
            "department_id": req.department_id,
            "year": active_year
        })
        if existing_count >= limit:
            raise HTTPException(
                status_code=400,
                detail=f"Limit reached. Only {limit} athletes from a department can participate in '{event['name']}'."
            )

        # Rule 2: Max 4 events per athlete
        athlete_events = check_athlete_event_count(student_id)
        if athlete_events >= 4:
            raise HTTPException(
                status_code=400,
                detail=f"Rule Violation: Student '{student_id}' has already registered for {athlete_events} events (max 4)."
            )

        reg_id = str(uuid.uuid4())
        new_reg = {
            "_id": reg_id,
            "event_id": req.event_id,
            "department_id": req.department_id,
            "type": req.type,
            "student_id": student_id,
            "student_name": req.student_name.strip(),
            "gender": req.gender.strip().lower(),
            "year": active_year,
            "created_at": datetime.utcnow().isoformat()
        }
        registrations_col.insert_one(new_reg)
        return {"success": True, "registration_id": reg_id}

    else: # team or others (with max_members > 1)
        if not req.team_leader or not req.members:
            raise HTTPException(status_code=400, detail="Team leader and members list are required.")
        
        # Roster size check
        total_size = 1 + len(req.members)
        if total_size != max_members:
            raise HTTPException(
                status_code=400, 
                detail=f"Roster size error. This event requires exactly {max_members} participants (1 Leader + {max_members - 1} Members)."
            )

        # Rule 1: Only 1 registration per department for team/others events
        existing_count = registrations_col.count_documents({
            "event_id": req.event_id,
            "department_id": req.department_id,
            "year": active_year
        })
        if existing_count >= 1:
            raise HTTPException(status_code=400, detail="A registration has already been made for this event.")

        # Check event limit for all roster members
        leader_id = req.team_leader.dept_num.strip()
        leader_events = check_athlete_event_count(leader_id)
        if leader_events >= 4:
            raise HTTPException(
                status_code=400,
                detail=f"Rule Violation: Team Leader '{leader_id}' has registered for {leader_events} events (max 4)."
            )
        
        for idx, m in enumerate(req.members):
            member_id = m.dept_num.strip()
            member_events = check_athlete_event_count(member_id)
            if member_events >= 4:
                raise HTTPException(
                    status_code=400,
                    detail=f"Rule Violation: Member #{idx+1} '{m.name}' ({member_id}) has registered for {member_events} events (max 4)."
                )

        reg_id = str(uuid.uuid4())
        new_reg = {
            "_id": reg_id,
            "event_id": req.event_id,
            "department_id": req.department_id,
            "type": req.type,
            "team_leader": {
                "name": req.team_leader.name.strip(),
                "dept_num": leader_id
            },
            "members": [
                {
                    "name": m.name.strip(),
                    "dept_num": m.dept_num.strip(),
                    "gender": m.gender.strip().lower()
                } for m in req.members
            ],
            "year": active_year,
            "created_at": datetime.utcnow().isoformat()
        }
        registrations_col.insert_one(new_reg)
        return {"success": True, "registration_id": reg_id}

@router.put("/edit/{reg_id}")
def edit_registration(reg_id: str, req: RegistrationRequest):
    reg = registrations_col.find_one({"_id": reg_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found.")

    if is_deadline_passed(reg["event_id"]):
        raise HTTPException(status_code=400, detail="Registration deadline has passed. Cannot edit.")

    event = events_col.find_one({"_id": reg["event_id"]})
    max_members = event.get("max_members", 1)

    if reg["type"] == "solo" or max_members <= 1:
        if not req.student_id or not req.student_name or not req.gender:
            raise HTTPException(status_code=400, detail="Student ID, Name, and Gender are required.")

        student_id = req.student_id.strip()
        athlete_events = check_athlete_event_count(student_id, current_reg_id=reg_id)
        if athlete_events >= 4:
            raise HTTPException(
                status_code=400,
                detail=f"Rule Violation: Student '{student_id}' is already in {athlete_events} other events (max 4)."
            )

        registrations_col.update_one(
            {"_id": reg_id},
            {
                "$set": {
                    "student_id": student_id,
                    "student_name": req.student_name.strip(),
                    "gender": req.gender.strip().lower()
                }
            }
        )
        return {"success": True, "message": "Registration updated successfully."}

    else: # team/others
        if not req.team_leader or not req.members:
            raise HTTPException(status_code=400, detail="Team leader and members are required.")

        total_size = 1 + len(req.members)
        if total_size != max_members:
            raise HTTPException(
                status_code=400, 
                detail=f"Roster size error. This event requires exactly {max_members} participants (1 Leader + {max_members - 1} Members)."
            )

        leader_id = req.team_leader.dept_num.strip()
        leader_events = check_athlete_event_count(leader_id, current_reg_id=reg_id)
        if leader_events >= 4:
            raise HTTPException(
                status_code=400,
                detail=f"Rule Violation: Team Leader '{leader_id}' is in {leader_events} other events (max 4)."
            )

        for idx, m in enumerate(req.members):
            member_id = m.dept_num.strip()
            member_events = check_athlete_event_count(member_id, current_reg_id=reg_id)
            if member_events >= 4:
                raise HTTPException(
                    status_code=400,
                    detail=f"Rule Violation: Member #{idx+1} '{m.name}' ({member_id}) is in {member_events} other events (max 4)."
                )

        registrations_col.update_one(
            {"_id": reg_id},
            {
                "$set": {
                    "team_leader": {
                        "name": req.team_leader.name.strip(),
                        "dept_num": leader_id
                    },
                    "members": [
                        {
                            "name": m.name.strip(),
                            "dept_num": m.dept_num.strip(),
                            "gender": m.gender.strip().lower()
                        } for m in req.members
                    ]
                }
            }
        )
        return {"success": True, "message": "Roster updated successfully."}

@router.delete("/delete/{reg_id}")
def delete_registration(reg_id: str):
    reg = registrations_col.find_one({"_id": reg_id})
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found.")

    if is_deadline_passed(reg["event_id"]):
        raise HTTPException(status_code=400, detail="Registration deadline has passed. Cannot delete.")

    registrations_col.delete_one({"_id": reg_id})
    return {"success": True, "message": "Registration deleted successfully."}
