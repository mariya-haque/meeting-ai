"""Thin wrapper around the Google Calendar API.

All functions accept a token dict (as stored on the user record) and build
short-lived credentials + a Calendar service on demand.
"""
import uuid

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from .google_oauth import SCOPES


def _service(token_dict: dict):
    creds = Credentials(
        token=token_dict.get("token"),
        refresh_token=token_dict.get("refresh_token"),
        token_uri=token_dict.get("token_uri"),
        client_id=token_dict.get("client_id"),
        client_secret=token_dict.get("client_secret"),
        scopes=token_dict.get("scopes", SCOPES),
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _to_event(item: dict) -> dict:
    start = item.get("start", {})
    end = item.get("end", {})
    attendees = [a.get("email") for a in item.get("attendees", []) if a.get("email")]
    return {
        "id": item.get("id"),
        "title": item.get("summary", "(no title)"),
        "description": item.get("description"),
        "start": start.get("dateTime") or start.get("date"),
        "end": end.get("dateTime") or end.get("date"),
        "meet_link": item.get("hangoutLink"),
        "participants": attendees,
        "status": item.get("status"),
    }


def list_upcoming_events(token_dict: dict, time_min: str, max_results: int = 50) -> list[dict]:
    service = _service(token_dict)
    result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=time_min,
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    return [_to_event(i) for i in result.get("items", [])]


def create_event(
    token_dict: dict,
    title: str,
    start: str,
    end: str,
    description: str | None = None,
    participants: list[str] | None = None,
    add_meet_link: bool = True,
) -> dict:
    service = _service(token_dict)
    body: dict = {
        "summary": title,
        "description": description,
        "start": {"dateTime": start},
        "end": {"dateTime": end},
        "attendees": [{"email": e} for e in (participants or [])],
    }
    kwargs = {"calendarId": "primary", "body": body, "sendUpdates": "all"}
    if add_meet_link:
        body["conferenceData"] = {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        }
        kwargs["conferenceDataVersion"] = 1
    created = service.events().insert(**kwargs).execute()
    return _to_event(created)


def update_event(token_dict: dict, event_id: str, **fields) -> dict:
    service = _service(token_dict)
    existing = service.events().get(calendarId="primary", eventId=event_id).execute()
    if "title" in fields and fields["title"] is not None:
        existing["summary"] = fields["title"]
    if fields.get("description") is not None:
        existing["description"] = fields["description"]
    if fields.get("start") is not None:
        existing["start"] = {"dateTime": fields["start"]}
    if fields.get("end") is not None:
        existing["end"] = {"dateTime": fields["end"]}
    if fields.get("participants") is not None:
        existing["attendees"] = [{"email": e} for e in fields["participants"]]
    updated = (
        service.events()
        .update(calendarId="primary", eventId=event_id, body=existing, sendUpdates="all")
        .execute()
    )
    return _to_event(updated)


def delete_event(token_dict: dict, event_id: str) -> None:
    service = _service(token_dict)
    service.events().delete(
        calendarId="primary", eventId=event_id, sendUpdates="all"
    ).execute()
