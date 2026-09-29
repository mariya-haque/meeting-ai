"""Seed the database with a demo user, meetings, participants, and tasks.

Run from the backend/ directory:  python seed.py
"""
from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
from app import models
from app.security import hash_password

Base.metadata.create_all(bind=engine)


def run():
    db = SessionLocal()
    try:
        email = "demo@example.com"
        user = db.query(models.User).filter_by(email=email).first()
        if not user:
            user = models.User(
                name="Demo User", email=email, hashed_password=hash_password("demo1234")
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if db.query(models.Meeting).filter_by(owner_id=user.id).count() > 0:
            print("Demo data already exists. Skipping.")
            return

        today = date.today()
        m1 = models.Meeting(
            owner_id=user.id,
            title="Product Kickoff with Acme Corp",
            platform="google_meet",
            meeting_date=today + timedelta(days=2),
            start_time="10:00",
            end_time="11:00",
            meeting_link="https://meet.google.com/abc-defg-hij",
            company="Acme Corp",
            summary="Kickoff for the new analytics dashboard project.",
            status="upcoming",
            participants=[
                models.Participant(name="Jane Smith", email="jane@acme.com"),
                models.Participant(name="Bob Lee", email="bob@acme.com"),
            ],
        )
        m2 = models.Meeting(
            owner_id=user.id,
            title="Weekly Sync",
            platform="zoom",
            meeting_date=today - timedelta(days=3),
            start_time="15:00",
            end_time="15:30",
            company="Internal",
            summary="Reviewed sprint progress and blockers.",
            discussion="Discussed API latency and the new onboarding flow.",
            decisions="Ship onboarding v2 next week.",
            next_steps="QA to finish regression testing.",
            status="completed",
            zoom_meeting_id="123 456 7890",
            zoom_passcode="secret",
            participants=[models.Participant(name="Alex Doe", email="alex@internal.com")],
        )
        db.add_all([m1, m2])
        db.commit()
        db.refresh(m2)

        db.add_all(
            [
                models.Task(
                    owner_id=user.id,
                    meeting_id=m2.id,
                    title="Finish regression testing",
                    description="Cover onboarding v2 edge cases.",
                    assigned_to="QA Team",
                    priority="high",
                    due_date=today + timedelta(days=1),
                    status="in_progress",
                ),
                models.Task(
                    owner_id=user.id,
                    title="Prepare kickoff deck",
                    priority="medium",
                    due_date=today + timedelta(days=1),
                    status="pending",
                ),
            ]
        )
        db.commit()
        print("Seeded demo data. Login: demo@example.com / demo1234")
    finally:
        db.close()


if __name__ == "__main__":
    run()
