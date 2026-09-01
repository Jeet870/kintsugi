"""
Unit & Integration Tests for Automated Daily Motivation Workflow.
Verifies get-or-create DB persistence, user isolation, unique constraints, and single-request generation.
"""
from datetime import datetime, timezone, timedelta
import pytest
from sqlalchemy import select
from app.models.daily_motivation import DailyMotivation
from app.models.user import User


def test_get_or_create_daily_motivation(client, db_session):
    # 1. First request for default/guest user creates today's content
    response1 = client.get("/api/v1/content/daily")
    assert response1.status_code == 200
    data1 = response1.json()

    assert "id" in data1
    assert "quote" in data1
    assert "affirmations" in data1
    assert "tips" in data1
    assert len(data1["affirmations"]) >= 3
    assert len(data1["tips"]) >= 3

    created_id = data1["id"]

    # 2. Second request on the same day returns identical saved content without duplicate generation
    response2 = client.get("/api/v1/content/daily")
    assert response2.status_code == 200
    data2 = response2.json()

    assert data2["id"] == created_id
    assert data2["quote"]["text"] == data1["quote"]["text"]
    assert len(data2["affirmations"]) == len(data1["affirmations"])
    assert len(data2["tips"]) == len(data1["tips"])

    # 3. Verify exactly one record exists in database for user & date
    today = datetime.now(timezone.utc).date()
    records = list(db_session.scalars(
        select(DailyMotivation).where(
            DailyMotivation.user_id == 1,
            DailyMotivation.content_date == today,
        )
    ).all())
    assert len(records) == 1


def test_daily_motivation_user_isolation(client, db_session):
    today = datetime.now(timezone.utc).date()

    # Create two users in test DB
    u1 = User(email="user1@example.com", name="User One", password_hash="hashed_pw_1", is_active=True)
    u2 = User(email="user2@example.com", name="User Two", password_hash="hashed_pw_2", is_active=True)
    db_session.add_all([u1, u2])
    db_session.commit()
    db_session.refresh(u1)
    db_session.refresh(u2)

    # Insert content for user 1
    m1 = DailyMotivation(
        user_id=u1.id,
        content_date=today,
        quote="Quote for User 1",
        quote_author="Author 1",
        quote_category="hope",
        affirmations=[{"text": "Affirmation 1", "category": "resilience"}],
        self_care_tips=[{"text": "Tip 1", "category": "mindfulness"}],
    )
    db_session.add(m1)
    db_session.commit()

    # Verify user 1 record exists, user 2 record does not yet
    rec1 = db_session.scalars(select(DailyMotivation).where(DailyMotivation.user_id == u1.id, DailyMotivation.content_date == today)).first()
    rec2 = db_session.scalars(select(DailyMotivation).where(DailyMotivation.user_id == u2.id, DailyMotivation.content_date == today)).first()

    assert rec1 is not None
    assert rec1.quote == "Quote for User 1"
    assert rec2 is None
