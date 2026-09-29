# 🤖 Personal AI Meeting & Calendar Management System

A personal productivity assistant to manage meetings, calendar events, notes, and
tasks — with **Google Calendar / Google Meet** integration and manual **Zoom** logging.

- **Backend:** FastAPI · SQLAlchemy · JWT auth · Google OAuth 2.0 · Google Calendar API
- **Frontend:** React (Vite) · Tailwind CSS · React Router · Axios
- **Database:** SQLite by default (zero-config), PostgreSQL-ready

---

## ✨ Features

| Area | What you get |
|------|--------------|
| **Auth** | Email/password + JWT, Google OAuth 2.0 login, one-click demo account |
| **Dashboard** | Analytics cards (totals, week/month, tasks) + upcoming & completed meetings |
| **Meetings** | Full CRUD, participants, summary, discussion, decisions, next steps, notes |
| **Calendar** | Month grid view; sync/pull events from Google Calendar |
| **Google Meet** | Create Calendar events with auto-generated Meet links |
| **Zoom** | Manual logging: link, meeting ID, passcode, notes |
| **Tasks** | Create/track action items with priority, due date, status; link to meetings |
| **History** | Search + filter by status, platform, company, participant |
| **UI** | Responsive sidebar layout, stat cards, dark mode |

---

## 📁 Project structure

```
meeting-ai/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS + routers
│   │   ├── config.py          # settings from .env
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # User, Meeting, Participant, Task
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── security.py        # JWT + password hashing
│   │   ├── deps.py            # get_current_user dependency
│   │   ├── google_oauth.py    # OAuth 2.0 flow
│   │   ├── google_calendar.py # Calendar API wrapper
│   │   └── routers/           # auth, meetings, tasks, dashboard, calendar
│   ├── seed.py                # demo data
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Dashboard, Calendar, Tasks, ...
    │   ├── components/        # Layout, Sidebar, Navbar, cards
    │   ├── context/           # AuthContext
    │   ├── api/client.js      # Axios instance (JWT interceptor)
    │   └── utils/, hooks/
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- *(Optional)* a Google Cloud OAuth client for Google login / Calendar sync
- *(Optional)* PostgreSQL — SQLite is used by default

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env          # (Windows)  |  cp .env.example .env

python seed.py                  # optional: creates demo data
uvicorn app.main:app --reload   # http://localhost:8000  (docs at /docs)
```

### 2. Frontend (React)

```bash
cd frontend
npm install
copy .env.example .env          # (Windows)  |  cp .env.example .env
npm run dev                     # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:8000`, so no CORS setup is
needed in development.

### 3. Log in

- Click **“Try demo account”** on the login page, or
- Register an email/password, or
- **Continue with Google** (requires Google setup below).

Demo credentials: `demo@example.com` / `demo1234`

### Environment variables

**`backend/.env`** (see `backend/.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_NAME` | `Personal AI Meeting Assistant` | API title |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin and OAuth redirect target |
| `DATABASE_URL` | `sqlite:///./meeting_ai.db` | SQLAlchemy URL (SQLite or PostgreSQL) |
| `SECRET_KEY` | placeholder | Signs JWTs — **change it** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Token lifetime |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | *(blank)* | Enables Google login + Calendar |
| `GOOGLE_REDIRECT_URI` | `http://localhost:8000/api/auth/google/callback` | Must match the OAuth client |

**`frontend/.env`**: `VITE_API_URL` (default `/api`, served through the Vite proxy).

---

## 🔑 Google OAuth + Calendar setup (optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project → **APIs & Services** → enable **Google Calendar API**.
3. **OAuth consent screen**: configure (External), add your email as a test user,
   and add scopes for `userinfo.email`, `userinfo.profile`, and `calendar`.
4. **Credentials** → **Create OAuth client ID** → *Web application*.
   - Authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
5. Copy the client ID/secret into `backend/.env`:

   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   ```

6. Restart the backend and use **Continue with Google**. Once connected, the
   **Calendar → Sync Google** button pulls upcoming events into your meetings.

---

## 🐘 Switching to PostgreSQL

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/meeting_ai
```

Tables are auto-created on startup. For production, wire up
[Alembic](https://alembic.sqlalchemy.org/) migrations instead of `create_all`.

---

## 📡 API overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` `/login` `/demo` | Auth (returns JWT) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/google/login` → `/callback` | Google OAuth |
| GET/POST/PUT/DELETE | `/api/meetings` | Meetings CRUD + filters/search |
| GET/POST/PUT/DELETE | `/api/tasks` | Tasks CRUD (complete a task by `PUT` with `status`) |
| GET | `/api/dashboard/stats` `/upcoming` `/completed` | Analytics |
| GET/POST/PUT/DELETE | `/api/calendar/events` | Google Calendar events |
| POST | `/api/calendar/sync` | Import events into meetings |

Interactive API docs: **http://localhost:8000/docs**

---

## 🧭 Notes & next steps

- Notes are stored as plain text; swap the textareas for a rich-text editor
  (e.g. TipTap) if you want formatting.
- Zoom is manual-only here; add the Zoom API (OAuth + `/users/me/meetings`) for
  automatic sync, mirroring the Google Calendar module.
- `Base.metadata.create_all` is fine for local dev; use Alembic for real migrations.
