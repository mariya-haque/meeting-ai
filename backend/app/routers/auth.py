from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..security import create_access_token, hash_password, verify_password
from .. import google_oauth

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_response(user: models.User) -> schemas.Token:
    token = create_access_token(user.id)
    return schemas.Token(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.scalar(select(models.User).where(models.User.email == payload.email))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email))
    if not user or not user.hashed_password or not verify_password(
        payload.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    return _token_response(user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/demo", response_model=schemas.Token)
def demo_login(db: Session = Depends(get_db)):
    """Create/return a demo account so the app is usable without Google setup."""
    email = "demo@example.com"
    user = db.scalar(select(models.User).where(models.User.email == email))
    if not user:
        user = models.User(
            name="Demo User",
            email=email,
            hashed_password=hash_password("demo1234"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _token_response(user)


# ----------------------------- Google OAuth -----------------------------
@router.get("/google/login")
def google_login():
    if not settings.google_enabled:
        raise HTTPException(
            status_code=400,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID / SECRET in .env",
        )
    auth_url, _state = google_oauth.get_authorization_url()
    return {"url": auth_url}


@router.get("/google/callback")
def google_callback(code: str | None = None, error: str | None = None, db: Session = Depends(get_db)):
    if error or not code:
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_denied")

    token_dict = google_oauth.exchange_code(code)
    info = google_oauth.fetch_userinfo(token_dict["token"])

    user = db.scalar(select(models.User).where(models.User.email == info["email"]))
    if not user:
        user = models.User(
            name=info.get("name", info["email"]),
            email=info["email"],
            google_id=info.get("id"),
            profile_image=info.get("picture"),
        )
        db.add(user)
    else:
        user.google_id = info.get("id")
        user.profile_image = info.get("picture") or user.profile_image
    user.google_token = google_oauth.dump_token(token_dict)
    db.commit()
    db.refresh(user)

    jwt_token = create_access_token(user.id)
    return RedirectResponse(f"{settings.frontend_url}/login?token={jwt_token}")
