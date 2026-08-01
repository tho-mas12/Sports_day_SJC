import os
from datetime import datetime, timedelta
from pathlib import Path
from supabase import create_client, Client

# Load environment variables from .env file
def load_env():
    backend_dir = Path(__file__).resolve().parent
    root_dir = backend_dir.parent
    for folder in [backend_dir, root_dir]:
        env_path = folder / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        val = val.strip().strip("'\"")
                        os.environ[key.strip()] = val

load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be configured in environment variables or .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class SupabaseCollection:
    def __init__(self, table_name):
        self.table_name = table_name

    def _map_doc(self, doc):
        if not doc:
            return None
        d = dict(doc)
        if self.table_name == "system_settings":
            val = d.pop("value", {})
            if isinstance(val, dict):
                d.update(val)
        
        # Always map standard identifiers to _id for backend compatibility
        if "id" in d:
            d["_id"] = d["id"]
        elif "department_id" in d:
            d["_id"] = d["department_id"]
        return d

    def find_one(self, filter=None, *args, **kwargs):
        filter = filter or {}
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).select("*")
        for k, v in filter.items():
            if isinstance(v, dict):
                for op, val in v.items():
                    if op == "$in":
                        query = query.in_(k, val)
                    elif op == "$ne":
                        query = query.neq(k, val)
            else:
                query = query.eq(k, v)

        res = query.execute()
        if res.data and len(res.data) > 0:
            return self._map_doc(res.data[0])
        return None

    def find(self, filter=None, *args, **kwargs):
        filter = filter or {}
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).select("*")
        for k, v in filter.items():
            if isinstance(v, dict):
                for op, val in v.items():
                    if op == "$in":
                        query = query.in_(k, val)
                    elif op == "$ne":
                        query = query.neq(k, val)
            else:
                query = query.eq(k, v)

        res = query.execute()
        return [self._map_doc(d) for d in (res.data or [])]

    def insert_one(self, doc):
        doc = dict(doc)
        if "_id" in doc:
            doc["id"] = doc.pop("_id")

        if self.table_name == "system_settings":
            id_val = doc.pop("id")
            payload = {"id": id_val, "value": doc}
        else:
            payload = doc

        res = supabase.table(self.table_name).insert(payload).execute()
        
        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertOneResult(payload.get("id"))

    def update_one(self, filter, update, upsert=False, *args, **kwargs):
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        set_data = update.get("$set", {})
        id_val = filter.get("id") or filter.get("department_id")

        existing = self.find_one(filter)

        if self.table_name == "system_settings":
            rec = existing or {"id": id_val}
            for k, v in set_data.items():
                rec[k] = v
            
            val_payload = {}
            for k, v in rec.items():
                if k not in ["id", "_id"]:
                    val_payload[k] = v
            
            payload = {"id": id_val, "value": val_payload}
            if existing:
                res = supabase.table(self.table_name).update(payload).eq("id", id_val).execute()
            elif upsert:
                res = supabase.table(self.table_name).insert(payload).execute()
        else:
            has_nested = any("." in k for k in set_data.keys())
            if has_nested or existing:
                rec = existing or {}
                for k, v in set_data.items():
                    if "." in k:
                        parts = k.split(".")
                        parent_key = parts[0]
                        child_key = parts[1]
                        if parent_key not in rec or not isinstance(rec[parent_key], dict):
                            rec[parent_key] = {}
                        rec[parent_key][child_key] = v
                    else:
                        rec[k] = v
                
                payload = {}
                for k, v in rec.items():
                    if k == "_id":
                        pass
                    elif k == "department_id" and self.table_name == "issued_events":
                        payload["department_id"] = v
                    else:
                        payload[k] = v
                
                if self.table_name == "issued_events":
                    res = supabase.table(self.table_name).update(payload).eq("department_id", id_val).execute()
                else:
                    res = supabase.table(self.table_name).update(payload).eq("id", id_val).execute()
            else:
                if upsert:
                    payload = {}
                    for k, v in filter.items():
                        if k == "department_id" and self.table_name == "issued_events":
                            payload["department_id"] = v
                        elif k != "_id":
                            payload[k] = v
                    for k, v in set_data.items():
                        payload[k] = v
                    res = supabase.table(self.table_name).insert(payload).execute()

        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(1 if existing else 0, 1)

    def delete_one(self, filter, *args, **kwargs):
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).delete()
        for k, v in filter.items():
            query = query.eq(k, v)
        res = query.execute()
        
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count
        return DeleteResult(len(res.data or []))

    def delete_many(self, filter, *args, **kwargs):
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).delete()
        for k, v in filter.items():
            query = query.eq(k, v)
        res = query.execute()
        
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count
        return DeleteResult(len(res.data or []))

    def count_documents(self, filter=None, *args, **kwargs):
        filter = filter or {}
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).select("*")
        for k, v in filter.items():
            if isinstance(v, dict):
                for op, val in v.items():
                    if op == "$in":
                        query = query.in_(k, val)
                    elif op == "$ne":
                        query = query.neq(k, val)
            else:
                query = query.eq(k, v)

        res = query.execute()
        return len(res.data or [])

    def update_many(self, filter, update, *args, **kwargs):
        records = self.find(filter)
        pull_data = update.get("$pull", {})
        
        for rec in records:
            updated = False
            for k, val in pull_data.items():
                if k in rec and isinstance(rec[k], list):
                    if val in rec[k]:
                        rec[k] = [x for x in rec[k] if x != val]
                        updated = True
            
            if updated:
                payload = {}
                for key, v in rec.items():
                    if key == "_id":
                        pass
                    elif key == "department_id" and self.table_name == "issued_events":
                        payload["department_id"] = v
                    else:
                        payload[key] = v
                
                if self.table_name == "issued_events":
                    res = supabase.table(self.table_name).update(payload).eq("department_id", rec["department_id"]).execute()
                else:
                    res = supabase.table(self.table_name).update(payload).eq("id", rec["id"]).execute()

        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(len(records), len(records))

# Mock Collections representing Supabase tables
departments_col = SupabaseCollection("departments")
events_col = SupabaseCollection("events")
issued_events_col = SupabaseCollection("issued_events")
registrations_col = SupabaseCollection("registrations")
settings_col = SupabaseCollection("system_settings")

DEFAULT_RULES = [
    "Only Three Athletes from a team can participate in an event except 800 Mts. Race, 1500Mts. Race, 5000 Mts. Race, 10,000 Mts. Race & 20 km walk.",
    "An Athlete can participate in not more than four events.",
    "For team events (Relays), a department can register at most one team.",
    "Department Number is a unique identifier. The same Department Number must be used for a student across all registrations."
]

def seed_database():
    try:
        # Check if we can reach the settings table
        # If it fails, database public schema table doesn't exist yet
        settings_col.find_one({"_id": "rules"})
    except Exception as e:
        print("\n" + "="*80)
        print(" [WARNING] DATABASE NOT YET READY")
        print(" Supabase connection was made, but target database tables are missing.")
        print(" Please paste and execute the SQL Table schemas in your Supabase Dashboard SQL Editor!")
        print(" Details:", str(e))
        print("="*80 + "\n")
        return

    # 1. Seed Settings (Rules and Deadlines)
    if not settings_col.find_one({"_id": "rules"}):
        settings_col.insert_one({
            "_id": "rules",
            "rules": DEFAULT_RULES
        })
        print("Seeded default rules.")

    if not settings_col.find_one({"_id": "deadlines"}):
        default_dl = (datetime.utcnow() + timedelta(days=7)).isoformat()
        settings_col.insert_one({
            "_id": "deadlines",
            "common_deadline": default_dl,
            "event_deadlines": {}
        })
        print("Seeded default deadlines.")
        
    if not settings_col.find_one({"_id": "notification"}):
        settings_col.insert_one({
            "_id": "notification",
            "text": "Welcome to SJC Sports Day Registration portal. Please complete registration before the deadline!"
        })
        print("Seeded default notifications.")

    # 2. Seed Events
    boys_events = [
        {"_id": "b_100m", "name": "100 Mts. Dash", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_200m", "name": "200 Mts. Dash", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_400m", "name": "400 Mts. Dash", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_800m", "name": "800 Mts. Race", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_1500m", "name": "1500 Mts. Race", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_5000m", "name": "5000 Mts. Race", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_10000m", "name": "10,000 Mts. Race", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_lj", "name": "Long Jump", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_tj", "name": "Triple Jump", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_hj", "name": "High Jump", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_pv", "name": "Pole Vault", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_sp", "name": "Shot Put", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_ht", "name": "Hammer Throw", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_jt", "name": "Javelin Throw", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_dt", "name": "Discus Throw", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_110mh", "name": "110 Mts Hurdles", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_20kmw", "name": "20 km Walk", "type": "solo", "gender": "boys", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "b_relay_4x100", "name": "4 x 100 Mts. Relay", "type": "team", "gender": "boys", "max_members": 4, "is_visible": True, "other_details": ""},
        {"_id": "b_relay_4x400", "name": "4 x 400 Mts. Relay", "type": "team", "gender": "boys", "max_members": 4, "is_visible": True, "other_details": ""},
    ]

    girls_events = [
        {"_id": "g_100m", "name": "100 Mts. Dash", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_200m", "name": "200 Mts. Dash", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_lj", "name": "Long Jump", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_sp", "name": "Shot Put", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_dt", "name": "Discus Throw", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_400m", "name": "400 Mts Dash", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_800m", "name": "800 Mts. Race", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
        {"_id": "g_relay_4x100", "name": "4x100 Mts. Relay", "type": "team", "gender": "girls", "max_members": 4, "is_visible": True, "other_details": ""},
    ]

    all_events = boys_events + girls_events
    for ev in all_events:
        db_ev = events_col.find_one({"_id": ev["_id"]})
        if not db_ev:
            events_col.insert_one(ev)
        else:
            update_fields = {}
            if "max_members" not in db_ev:
                update_fields["max_members"] = ev["max_members"]
            if "is_visible" not in db_ev:
                update_fields["is_visible"] = ev["is_visible"]
            if "other_details" not in db_ev:
                update_fields["other_details"] = ev["other_details"]
            if update_fields:
                events_col.update_one({"_id": ev["_id"]}, {"$set": update_fields})

    print(f"Seeded/Updated {len(all_events)} events.")

    # 3. Seed Departments
    shift1_depts = [
        ("hrm_s1", "Dept. of HRM"),
        ("chemistry_s1", "Dept. of Chemistry"),
        ("commerce_s1", "Dept. of Commerce"),
        ("english_s1", "Dept. of English"),
        ("history_s1", "Dept. of History"),
        ("cs_s1", "Dept. of Computer Science"),
        ("economics_s1", "Dept. of Economics"),
        ("maths_s1", "Dept. of Mathematics"),
        ("physics_s1", "Dept. of Physics"),
        ("botany_s1", "Dept. of Botany"),
        ("tamil_s1", "Dept. of Tamil"),
        ("bvoc_viscom_s1", "B.Voc. & B.Sc. Viscom"),
        ("statistics_s1", "Dept. of Statistics"),
    ]

    shift2_depts = [
        ("bsc_cs_s2", "B.Sc. Computer Science"),
        ("it_s2", "Information Tech"),
        ("bba_s2", "BBA"),
        ("biochem_biotech_s2", "Bio. Chem. & Bio Tech"),
        ("maths_s2", "Maths."),
        ("commerce_s2", "Commerce"),
        ("commerce_ca_s2", "Commerce CA"),
        ("english_s2", "English ."),
        ("physics_s2", "Physics"),
        ("bcom_honours_s2", "B.Com. Honours & Analytics"),
        ("electronics_chemistry_s2", "Electronics & Chemistry"),
        ("ds_ai_s2", "Data Science & Artificial Intelligence"),
        ("counselling_psych_s2", "Counselling Psychology"),
    ]

    girls_allowed_names = [
        "botany", "chemistry", "commerce", "economics", "computer science",
        "it", "information tech", "english", "hrm", "mathematics", "maths",
        "physics", "electronics", "b.voc", "viscom", "statistics", "tamil",
        "bio chemistry", "bio technology", "biochem", "biotech", "commerce ca",
        "b.com", "honours", "strategic finance", "business analytics",
        "data science", "artificial intelligence", "machine learning",
        "counselling psychology", "history"
    ]

    def is_girls_allowed(dept_name: str) -> bool:
        name_lower = dept_name.lower()
        for keyword in girls_allowed_names:
            if keyword in name_lower:
                return True
        return False

    all_depts = []
    for d_id, d_name in shift1_depts:
        all_depts.append({"_id": d_id, "name": d_name, "shift": 1})
    for d_id, d_name in shift2_depts:
        all_depts.append({"_id": d_id, "name": d_name, "shift": 2})

    for dept in all_depts:
        db_dept = departments_col.find_one({"_id": dept["_id"]})
        if not db_dept:
            departments_col.insert_one({
                "_id": dept["_id"],
                "name": dept["name"],
                "shift": dept["shift"],
                "password": "",
                "secretaries": {}
            })
            print(f"Seeded department: {dept['name']}")
        
        issued = issued_events_col.find_one({"department_id": dept["_id"]})
        if not issued:
            b_ev_ids = [e["_id"] for e in boys_events]
            g_ev_ids = [e["_id"] for e in girls_events] if is_girls_allowed(dept["name"]) else []
            
            issued_events_col.insert_one({
                "department_id": dept["_id"],
                "boys": b_ev_ids,
                "girls": g_ev_ids
            })

    print("Seeding finished successfully.")

def get_active_year() -> str:
    try:
        doc = settings_col.find_one({"_id": "active_year"})
        if not doc:
            settings_col.insert_one({"_id": "active_year", "year": "2026"})
            return "2026"
        return doc.get("year", "2026")
    except Exception:
        # Fallback value if database schema is not created yet
        return "2026"

if __name__ == "__main__":
    seed_database()
