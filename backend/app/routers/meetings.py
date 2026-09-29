from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _get_owned_meeting(db: Session, meeting_id: int, user: models.User) -> models.Meeting:
    meeting = db.get(models.Meeting, meeting_id)
    if not meeting or meeting.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("", response_model=list[schemas.MeetingOut])
def list_meetings(
    status: str | None = None,
    platform: str | None = None,
    company: str | None = None,
    participant: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    stmt = select(models.Meeting).where(models.Meeting.owner_id == user.id)
    if status:
        stmt = stmt.where(models.Meeting.status == status)
    if platform:
        stmt = stmt.where(models.Meeting.platform == platform)
    if company:
        stmt = stmt.where(models.Meeting.company.ilike(f"%{company}%"))
    if participant:
        stmt = stmt.join(models.Participant).where(
            or_(
                models.Participant.name.ilike(f"%{participant}%"),
                models.Participant.email.ilike(f"%{participant}%"),
            )
        )
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                models.Meeting.title.ilike(like),
                models.Meeting.company.ilike(like),
                models.Meeting.summary.ilike(like),
                models.Meeting.notes.ilike(like),
                models.Meeting.discussion.ilike(like),
            )
        )
    stmt = stmt.order_by(models.Meeting.meeting_date.desc().nullslast(), models.Meeting.id.desc())
    return db.scalars(stmt).unique().all()


@router.get("/{meeting_id}", response_model=schemas.MeetingOut)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return _get_owned_meeting(db, meeting_id, user)


@router.post("", response_model=schemas.MeetingOut, status_code=201)
def create_meeting(
    payload: schemas.MeetingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    data = payload.model_dump(exclude={"participants"})
    meeting = models.Meeting(owner_id=user.id, **data)
    meeting.participants = [
        models.Participant(name=p.name, email=p.email) for p in payload.participants
    ]
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.put("/{meeting_id}", response_model=schemas.MeetingOut)
def update_meeting(
    meeting_id: int,
    payload: schemas.MeetingUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(db, meeting_id, user)
    data = payload.model_dump(exclude_unset=True, exclude={"participants"})
    for key, value in data.items():
        setattr(meeting, key, value)
    if payload.participants is not None:
        meeting.participants = [
            models.Participant(name=p.name, email=p.email) for p in payload.participants
        ]
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    meeting = _get_owned_meeting(db, meeting_id, user)
    db.delete(meeting)
    db.commit()
