"""Google OAuth 2.0 helpers.

Uses the installed/web app flow to authenticate the user and obtain
credentials that can also be used to call the Google Calendar API.
"""
import json

from google_auth_oauthlib.flow import Flow

from .config import settings

# Scopes: identity + calendar read/write.
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar",
]


def _client_config() -> dict:
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


def build_flow(state: str | None = None) -> Flow:
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES, state=state)
    flow.redirect_uri = settings.google_redirect_uri
    return flow


def get_authorization_url() -> tuple[str, str]:
    """Return (authorization_url, state)."""
    flow = build_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return auth_url, state


def exchange_code(code: str) -> dict:
    """Exchange an authorization code for credentials, returned as a dict."""
    flow = build_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    return credentials_to_dict(creds)


def credentials_to_dict(creds) -> dict:
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }


def fetch_userinfo(token: str) -> dict:
    """Fetch the Google profile for an access token."""
    import httpx

    resp = httpx.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def dump_token(token_dict: dict) -> str:
    return json.dumps(token_dict)


def load_token(token_str: str | None) -> dict | None:
    if not token_str:
        return None
    try:
        return json.loads(token_str)
    except json.JSONDecodeError:
        return None
