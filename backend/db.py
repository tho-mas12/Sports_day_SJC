import os
import pymongo
from datetime import datetime, timedelta
from pathlib import Path

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

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "sjc_sports_day")

# Override DNS nameservers to avoid local DNS timeout on Atlas SRV records
if MONGO_URI.startswith("mongodb+srv"):
    try:
        import dns.resolver
        dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
        dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
    except Exception:
        pass

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
departments_col = db["departments"]
events_col = db["events"]
issued_events_col = db["issued_events"]
registrations_col = db["registrations"]
settings_col = db["settings"]

DEFAULT_RULES = [
    "Only Three Athletes from a team can participate in an event except 800 Mts. Race, 1500Mts. Race, 5000 Mts. Race, 10,000 Mts. Race & 20 km walk.",
    "An Athlete can participate in not more than four events.",
    "For team events (Relays), a department can register at most one team.",
    "Department Number is a unique identifier. The same Department Number must be used for a student across all registrations."
]

def seed_database():
    # 1. Seed Settings (Rules and Deadlines)
    if not settings_col.find_one({"_id": "rules"}):
        settings_col.insert_one({
            "_id": "rules",
            "rules": DEFAULT_RULES
        })
        print("Seeded default rules.")

    if not settings_col.find_one({"_id": "deadlines"}):
        # Default deadline: 7 days from now
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
            # Ensure new fields are present on existing events
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
                "is_first_login": True,
                "vice_secretary": None,
                "student_secretary": None
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
    doc = settings_col.find_one({"_id": "active_year"})
    if not doc:
        settings_col.insert_one({"_id": "active_year", "year": "2026"})
        return "2026"
    return doc.get("year", "2026")

if __name__ == "__main__":
    seed_database()
