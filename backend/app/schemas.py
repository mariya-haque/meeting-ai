from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# ----------------------------- Auth / Users -----------------------------
class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserRegister(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    profile_image: str | None = None
    google_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ----------------------------- Participants -----------------------------
class ParticipantBase(BaseModel):
    name: str
    email: str | None = None


class ParticipantOut(ParticipantBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ------------------------------- Tasks ----------------------------------
class TaskBase(BaseModel):
    title: str
    description: str | None = None
    assigned_to: str | None = None
    priority: str = "medium"
    due_date: date | None = None
    status: str = "pending"
    meeting_id: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assigned_to: str | None = None
    priority: str | None = None
    due_date: date | None = None
    status: str | None = None
    meeting_id: int | None = None


class TaskOut(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------ Meetings --------------------------------
class MeetingBase(BaseModel):
    title: str
    platform: str = "google_meet"
    meeting_date: date | None = None
    start_time: str | None = None
    end_time: str | None = None
    meeting_link: str | None = None
    company: str | None = None
    summary: str | None = None
    discussion: str | None = None
    decisions: str | None = None
    next_steps: str | None = None
    notes: str | None = None
    follow_up_date: date | None = None
    status: str = "upcoming"
    zoom_meeting_id: str | None = None
    zoom_passcode: str | None = None


class MeetingCreate(MeetingBase):
    participants: list[ParticipantBase] = []


class MeetingUpdate(BaseModel):
    title: str | None = None
    platform: str | None = None
    meeting_date: date | None = None
    start_time: str | None = None
    end_time: str | None = None
    meeting_link: str | None = None
    company: str | None = None
    summary: str | None = None
    discussion: str | None = None
    decisions: str | None = None
    next_steps: str | None = None
    notes: str | None = None
    follow_up_date: date | None = None
    status: str | None = None
    zoom_meeting_id: str | None = None
    zoom_passcode: str | None = None
    participants: list[ParticipantBase] | None = None


class MeetingOut(MeetingBase):
    id: int
    owner_id: int
    google_event_id: str | None = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantOut] = []
    tasks: list[TaskOut] = []
    model_config = ConfigDict(from_attributes=True)


# ------------------------------ Dashboard -------------------------------
class DashboardStats(BaseModel):
    total_meetings: int
    meetings_this_week: int
    meetings_this_month: int
    completed_meetings: int
    upcoming_meetings: int
    pending_tasks: int
    total_tasks: int


# --------------------------- Google Calendar ----------------------------
class CalendarEvent(BaseModel):
    id: str | None = None
    title: str
    description: str | None = None
    start: str | None = None
    end: str | None = None
    meet_link: str | None = None
    participants: list[str] = []
    status: str | None = None


class CalendarEventCreate(BaseModel):
    title: str
    description: str | None = None
    start: str  # ISO 8601 datetime
    end: str    # ISO 8601 datetime
    participants: list[str] = []
    add_meet_link: bool = True
