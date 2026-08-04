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

import time
import json

class CollectionCache:
    def __init__(self, ttl=15):
        self._cache = {}
        self.ttl = ttl

    def get(self, key):
        if key in self._cache:
            ts, val = self._cache[key]
            if time.time() - ts < self.ttl:
                return val
            else:
                del self._cache[key]
        return None

    def set(self, key, value):
        self._cache[key] = (time.time(), value)

    def invalidate_all(self):
        self._cache.clear()

class SupabaseCollection:
    def __init__(self, table_name):
        self.table_name = table_name
        self.use_cache = table_name in ["departments", "events", "system_settings", "issued_events"]
        self.cache = CollectionCache(ttl=15) if self.use_cache else None

    def _make_cache_key(self, filter_dict):
        try:
            return json.dumps(filter_dict, sort_keys=True)
        except Exception:
            return str(filter_dict)

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

        if self.use_cache:
            cache_key = "find_one:" + self._make_cache_key(filter)
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached

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
        ret = None
        if res.data and len(res.data) > 0:
            ret = self._map_doc(res.data[0])

        if self.use_cache:
            cache_key = "find_one:" + self._make_cache_key(filter)
            self.cache.set(cache_key, ret)

        return ret

    def find(self, filter=None, *args, **kwargs):
        filter = filter or {}
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        if self.use_cache:
            cache_key = "find:" + self._make_cache_key(filter)
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached

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
        ret = [self._map_doc(d) for d in (res.data or [])]

        if self.use_cache:
            cache_key = "find:" + self._make_cache_key(filter)
            self.cache.set(cache_key, ret)

        return ret

    def insert_one(self, doc):
        if self.use_cache:
            self.cache.invalidate_all()
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
        if self.use_cache:
            self.cache.invalidate_all()
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
        if self.use_cache:
            self.cache.invalidate_all()
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
        if self.use_cache:
            self.cache.invalidate_all()
        filter = dict(filter)
        if "_id" in filter:
            filter["id"] = filter.pop("_id")

        query = supabase.table(self.table_name).delete()
        if not filter:
            query = query.neq("id", "system-dummy-nonexistent-id-val-123")
        else:
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

        if self.use_cache:
            cache_key = "count:" + self._make_cache_key(filter)
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached

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
        ret = len(res.data or [])

        if self.use_cache:
            cache_key = "count:" + self._make_cache_key(filter)
            self.cache.set(cache_key, ret)

        return ret

    def update_many(self, filter, update, *args, **kwargs):
        if self.use_cache:
            self.cache.invalidate_all()
        records = self.find(filter)
        pull_data = update.get("$pull", {})
        set_data = update.get("$set", {})
        
        for rec in records:
            updated = False
            for k, val in pull_data.items():
                if k in rec and isinstance(rec[k], list):
                    if val in rec[k]:
                        rec[k] = [x for x in rec[k] if x != val]
                        updated = True
            
            for k, val in set_data.items():
                if "." in k:
                    parts = k.split(".")
                    parent_key = parts[0]
                    child_key = parts[1]
                    if parent_key not in rec or not isinstance(rec[parent_key], dict):
                        rec[parent_key] = {}
                    rec[parent_key][child_key] = val
                    updated = True
                else:
                    rec[k] = val
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
        {"_id": "g_800m", "name": "800 mts", "type": "solo", "gender": "girls", "max_members": 1, "is_visible": True, "other_details": ""},
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

    # 3. Seed Restructured Departments
    shift1_boys = [
        ("hrm_s1", "Dept. of HRM (Shift I - Boys)"),
        ("chemistry_s1", "Dept. of Chemistry (Shift I - Boys)"),
        ("commerce_s1", "Dept. of Commerce (Shift I - Boys)"),
        ("english_s1", "Dept. of English (Shift I - Boys)"),
        ("history_s1", "Dept. of History (Shift I - Boys)"),
        ("cs_s1", "Dept. of Computer Science (Shift I - Boys)"),
        ("economics_s1", "Dept. of Economics (Shift I - Boys)"),
        ("maths_s1", "Dept. of Mathematics (Shift I - Boys)"),
        ("physics_s1", "Dept. of Physics (Shift I - Boys)"),
        ("botany_s1", "Dept. of Botany (Shift I - Boys)"),
        ("tamil_s1", "Dept. of Tamil (Shift I - Boys)"),
        ("statistics_s1", "Dept. of Statistics (Shift I - Boys)"),
    ]

    shift2_boys = [
        ("cs_s2", "B.Sc. Computer Science (Shift II - Boys)"),
        ("it_s2", "Information Tech (Shift II - Boys)"),
        ("bba_s2", "BBA (Shift II - Boys)"),
        ("biochem_s2", "Bio. Chem. & Bio Tech (Shift II - Boys)"),
        ("maths_s2", "Maths. (Shift II - Boys)"),
        ("commerce_s2", "Commerce (Shift II - Boys)"),
        ("commerce_ca_s2", "Commerce CA (Shift II - Boys)"),
        ("english_s2", "English (Shift II - Boys)"),
        ("physics_chem_s2", "Physics & Chemistry (Shift II - Boys)"),
        ("bcom_honors_s2", "B.Com., Honors (Shift II - Boys)"),
        ("bcom_sf_s2", "B.Com. Strategic Finance (Shift II - Boys)"),
        ("bcom_ba_s2", "B.Com. Business Analytics (Shift II - Boys)"),
        ("electronics_s2", "Electronics (Shift II - Boys)"),
        ("ds_ai_s2", "Data Science & Artificial Intelligence (Shift II - Boys)"),
        ("psychology_s2", "Dept. of Counselling Psychology (Shift II - Boys)"),
        ("bvoc_viscom_s2", "B.Voc. (SD & SA + Viscom Tech) & B.Sc./M.Sc. Viscom (Shift II - Boys)"),
        ("physical_edu_s2", "Physical Education (Shift II - Boys)"),
    ]

    girls_depts = [
        ("botany_girls", "Dept. of Botany (Girls)"),
        ("chemistry_girls", "Dept. of Chemistry (Girls)"),
        ("commerce_econ_girls", "Dept. of Commerce & Economics (Girls)"),
        ("cs_girls", "Dept. of Computer Science (Girls)"),
        ("it_girls", "Dept. of Information Technology (Girls)"),
        ("english_girls", "Dept. of English (Girls)"),
        ("hrm_girls", "Dept. of HRM (Girls)"),
        ("maths_girls", "Dept. of Mathematics (Girls)"),
        ("physics_elec_girls", "Dept. of Physics & Electronics (Girls)"),
        ("bvoc_viscom_girls", "Dept. of B.Voc., (SD & SA) & B.Sc. Viscom. (Girls)"),
        ("statistics_girls", "Dept. of Statistics (Girls)"),
        ("tamil_girls", "Dept. of Tamil (Girls)"),
        ("biochem_girls", "Dept. of Bio-Chemistry (Girls)"),
        ("biotech_girls", "Dept. of Bio-Technology (Girls)"),
        ("commerce_ca_girls", "Dept. of Commerce CA (Girls)"),
        ("bcom_h_sf_ba_girls", "B.Com., Honors, Strategic Finance & Business Analytic (Girls)"),
        ("ds_ai_ml_girls", "Dept. of Data Science & Artificial Intelligence & Machine Learning (Girls)"),
        ("psychology_girls", "Dept. of Counselling Psychology (Girls)"),
        ("history_girls", "Dept. of History (Girls)"),
    ]

    all_depts = []
    for d_id, d_name in shift1_boys:
        all_depts.append({"_id": d_id, "name": d_name, "shift": 1, "is_girls": False})
    for d_id, d_name in shift2_boys:
        all_depts.append({"_id": d_id, "name": d_name, "shift": 2, "is_girls": False})
    for d_id, d_name in girls_depts:
        all_depts.append({"_id": d_id, "name": d_name, "shift": 3, "is_girls": True})

    for dept in all_depts:
        db_dept = departments_col.find_one({"_id": dept["_id"]})
        if not db_dept:
            departments_col.insert_one({
                "_id": dept["_id"],
                "name": dept["name"],
                "shift": dept["shift"],
                "password": "sjc",
                "secretaries": {}
            })
            print(f"Seeded department: {dept['name']}")
        
        issued = issued_events_col.find_one({"department_id": dept["_id"]})
        if not issued:
            b_ev_ids = [e["_id"] for e in boys_events] if not dept["is_girls"] else []
            g_ev_ids = [e["_id"] for e in girls_events] if dept["is_girls"] else []
            
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
