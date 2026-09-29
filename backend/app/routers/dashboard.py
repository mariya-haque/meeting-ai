from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def stats(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    def count_meetings(*conditions) -> int:
        stmt = select(func.count()).select_from(models.Meeting).where(
            models.Meeting.owner_id == user.id, *conditions
        )
        return db.scalar(stmt) or 0

    def count_tasks(*conditions) -> int:
        stmt = select(func.count()).select_from(models.Task).where(
            models.Task.owner_id == user.id, *conditions
        )
        return db.scalar(stmt) or 0

    return schemas.DashboardStats(
        total_meetings=count_meetings(),
        meetings_this_week=count_meetings(models.Meeting.meeting_date >= week_start),
        meetings_this_month=count_meetings(models.Meeting.meeting_date >= month_start),
        completed_meetings=count_meetings(models.Meeting.status == "completed"),
        upcoming_meetings=count_meetings(models.Meeting.status == "upcoming"),
        pending_tasks=count_tasks(models.Task.status != "completed"),
        total_tasks=count_tasks(),
    )


@router.get("/upcoming", response_model=list[schemas.MeetingOut])
def upcoming(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    stmt = (
        select(models.Meeting)
        .where(models.Meeting.owner_id == user.id, models.Meeting.status == "upcoming")
        .order_by(models.Meeting.meeting_date.asc().nullslast(), models.Meeting.id.desc())
        .limit(limit)
    )
    return db.scalars(stmt).unique().all()


@router.get("/completed", response_model=list[schemas.MeetingOut])
def completed(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    stmt = (
        select(models.Meeting)
        .where(models.Meeting.owner_id == user.id, models.Meeting.status == "completed")
        .order_by(models.Meeting.meeting_date.desc().nullslast(), models.Meeting.id.desc())
        .limit(limit)
    )
    return db.scalars(stmt).unique().all()
