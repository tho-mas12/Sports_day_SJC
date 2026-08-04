from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, department, registration, admin, reports
from db import seed_database
import uvicorn

app = FastAPI(title="SJC Sports Day Registration API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
@app.on_event("startup")
def startup_db_seed():
    print("Checking database status on startup...")
    seed_database()

# Include Routers
app.include_router(auth.router)
app.include_router(department.router)
app.include_router(registration.router)
app.include_router(admin.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"status": "SJC Sports Day API is running."}

@app.get("/health")
@app.get("/api/health")
@app.head("/health")
@app.head("/api/health")
def health_check():
    try:
        from db import get_active_year
        active_year = get_active_year()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": "sjc-sports-api",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
