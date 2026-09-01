"""
Database Seeding Script for Initial Mental Health Content and Helpline Resources.
"""
import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.content_item import ContentItem
from app.models.helpline_resource import HelplineResource

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_data(db: Session) -> None:
    logger.info("Seeding initial mental health resources and helpline information...")
    # Add initial helpline resources
    helplines = [
        {
            "name": "National Suicide Prevention Lifeline",
            "phone_number": "988",
            "description": "24/7, free and confidential support for people in distress.",
            "country": "US",
            "is_emergency": True,
        },
        {
            "name": "Crisis Text Line",
            "phone_number": "Text HOME to 741741",
            "description": "Free 24/7 crisis support via text message.",
            "country": "US",
            "is_emergency": True,
        },
    ]

    for item in helplines:
        existing = db.query(HelplineResource).filter_by(name=item["name"]).first()
        if not existing:
            db.add(HelplineResource(**item))

    db.commit()
    logger.info("Database seeding complete.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
