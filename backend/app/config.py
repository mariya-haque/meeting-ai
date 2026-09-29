from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    app_name: str = "Personal AI Meeting Assistant"
    frontend_url: str = "http://localhost:5173"

    database_url: str = "sqlite:///./meeting_ai.db"

    secret_key: str = "change-me-to-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def google_enabled(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
