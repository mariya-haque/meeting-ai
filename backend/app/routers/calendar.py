from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import google_calendar, google_oauth, models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


def _require_google(user: models.User) -> dict:
    token = google_oauth.load_token(user.google_token)
    if not token:
        raise HTTPException(
            status_code=400,
            detail="Google account not connected. Sign in with Google to use Calendar.",
        )
    return token


@router.get("/events", response_model=list[schemas.CalendarEvent])
def get_events(
    max_results: int = 50,
    user: models.User = Depends(get_current_user),
):
    token = _require_google(user)
    now = datetime.now(timezone.utc).isoformat()
    try:
        return google_calendar.list_upcoming_events(token, now, max_results)
    except Exception as exc:  # pragma: no cover - surfaces Google API errors
        raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")


@router.post("/events", response_model=schemas.CalendarEvent, status_code=201)
def create_event(
    payload: schemas.CalendarEventCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    token = _require_google(user)
    try:
        event = google_calendar.create_event(
            token,
            title=payload.title,
            start=payload.start,
            end=payload.end,
            description=payload.description,
            participants=payload.participants,
            add_meet_link=payload.add_meet_link,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")

    # Mirror the event into the local meetings table.
    meeting = models.Meeting(
        owner_id=user.id,
        title=event["title"],
        platform="google_meet",
        meeting_link=event.get("meet_link"),
        summary=event.get("description"),
        google_event_id=event.get("id"),
        status="upcoming",
    )
    db.add(meeting)
    db.commit()
    return event


@router.put("/events/{event_id}", response_model=schemas.CalendarEvent)
def update_event(
    event_id: str,
    payload: schemas.CalendarEventCreate,
    user: models.User = Depends(get_current_user),
):
    token = _require_google(user)
    try:
        return google_calendar.update_event(
            token,
            event_id,
            title=payload.title,
            start=payload.start,
            end=payload.end,
            description=payload.description,
            participants=payload.participants,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")


@router.delete("/events/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    user: models.User = Depends(get_current_user),
):
    token = _require_google(user)
    try:
        google_calendar.delete_event(token, event_id)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")


@router.post("/sync")
def sync_calendar(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Pull upcoming Google Calendar events into the local meetings table."""
    token = _require_google(user)
    now = datetime.now(timezone.utc).isoformat()
    try:
        events = google_calendar.list_upcoming_events(token, now, 100)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")

    imported = 0
    for ev in events:
        if not ev.get("id"):
            continue
        existing = (
            db.query(models.Meeting)
            .filter_by(owner_id=user.id, google_event_id=ev["id"])
            .first()
        )
        if existing:
            continue
        start = ev.get("start") or ""
        meeting_date = None
        start_time = None
        if "T" in start:
            try:
                dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                meeting_date = dt.date()
                start_time = dt.strftime("%H:%M")
            except ValueError:
                pass
        db.add(
            models.Meeting(
                owner_id=user.id,
                title=ev["title"],
                platform="google_meet",
                meeting_date=meeting_date,
                start_time=start_time,
                meeting_link=ev.get("meet_link"),
                summary=ev.get("description"),
                google_event_id=ev["id"],
                status="upcoming",
            )
        )
        imported += 1
    db.commit()
    return {"imported": imported, "total_events": len(events)}
