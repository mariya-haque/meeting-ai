from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, calendar, dashboard, meetings, tasks

# Create tables on startup (use Alembic for real migrations in production).
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(calendar.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "status": "ok",
        "docs": "/docs",
        "google_oauth_enabled": settings.google_enabled,
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
