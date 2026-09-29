from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    # Stored Google OAuth credentials (JSON string) used for Calendar API calls.
    google_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    meetings: Mapped[list["Meeting"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    title: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(50), default="google_meet")
    meeting_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    start_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    end_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    meeting_link: Mapped[str | None] = mapped_column(String(512), nullable=True)

    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    discussion: Mapped[str | None] = mapped_column(Text, nullable=True)
    decisions: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_steps: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # upcoming | completed | cancelled
    status: Mapped[str] = mapped_column(String(20), default="upcoming", index=True)

    # Zoom specific fields
    zoom_meeting_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    zoom_passcode: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Link back to a Google Calendar event, if synced.
    google_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship(back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan"
    )


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="participants")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    meeting_id: Mapped[int | None] = mapped_column(
        ForeignKey("meetings.id"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # pending | in_progress | completed
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    owner: Mapped["User"] = relationship(back_populates="tasks")
    meeting: Mapped["Meeting"] = relationship(back_populates="tasks")
