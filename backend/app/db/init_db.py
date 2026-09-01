"""
Database Initialization and Startup Health Routine.
Verifies database connectivity, checks execution environment, auto-patches schema columns, and seeds reference data idempotently.
"""
import time
import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.constants import ContentType
from app.models.content_item import ContentItem
from app.models.helpline_resource import HelplineResource
from app.models.achievement import Achievement

from app.models import Base

logger = logging.getLogger("kintsugi.init_db")


def verify_db_connection(db: Session) -> bool:
    """
    Executes a lightweight query (SELECT 1) to verify database connectivity.
    """
    try:
        start_time = time.time()
        result = db.execute(text("SELECT 1;"))
        result.scalar()
        elapsed_ms = (time.time() - start_time) * 1000
        logger.info(f"Database connectivity check successful ({elapsed_ms:.2f}ms).")
        return True
    except SQLAlchemyError as err:
        logger.error(f"Database connectivity check failed: {err}")
        return False


def ensure_schema_columns(db: Session) -> None:
    """
    Auto-patches missing columns on existing MySQL database tables to prevent OperationalError 1054.
    """
    if db.bind and db.bind.dialect.name == "sqlite":
        logger.info("SQLite engine in use, skipping MySQL information_schema column checks.")
        return

    logger.info("Verifying and auto-patching database table schemas...")
    migrations = [
        ("chat_sessions", "title", "ALTER TABLE chat_sessions ADD COLUMN title VARCHAR(255) NULL;"),
        ("chat_sessions", "status", "ALTER TABLE chat_sessions ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';"),
        ("chat_sessions", "started_at", "ALTER TABLE chat_sessions ADD COLUMN started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;"),
        ("chat_sessions", "ended_at", "ALTER TABLE chat_sessions ADD COLUMN ended_at DATETIME NULL;"),
        ("chat_messages", "session_id", "ALTER TABLE chat_messages ADD COLUMN session_id BIGINT NULL;"),
        ("mood_entries", "ai_message", "ALTER TABLE mood_entries ADD COLUMN ai_message TEXT NULL;"),
        ("journal_entries", "ai_reflection", "ALTER TABLE journal_entries ADD COLUMN ai_reflection TEXT NULL;"),
        ("journal_entries", "mood_tag", "ALTER TABLE journal_entries ADD COLUMN mood_tag VARCHAR(50) NULL DEFAULT 'Calm';"),
        ("journal_entries", "ai_summary", "ALTER TABLE journal_entries ADD COLUMN ai_summary TEXT NULL;"),
        ("journal_entries", "ai_title", "ALTER TABLE journal_entries ADD COLUMN ai_title VARCHAR(255) NULL;"),
        ("journal_entries", "is_favorite", "ALTER TABLE journal_entries ADD COLUMN is_favorite TINYINT(1) NOT NULL DEFAULT 0;"),
        ("journal_entries", "is_pinned", "ALTER TABLE journal_entries ADD COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0;"),
    ]

    for table_name, column_name, alter_sql in migrations:
        try:
            check_sql = text(
                "SELECT COUNT(*) FROM information_schema.columns "
                "WHERE table_schema = DATABASE() AND table_name = :table_name AND column_name = :column_name"
            )
            count = db.execute(check_sql, {"table_name": table_name, "column_name": column_name}).scalar()
            if count == 0:
                logger.info(f"Adding missing column '{column_name}' to table '{table_name}'...")
                db.execute(text(alter_sql))
                db.commit()
                logger.info(f"Successfully added column '{column_name}' to table '{table_name}'.")
        except Exception as e:
            db.rollback()
            logger.warning(f"Error checking/adding column '{column_name}' on table '{table_name}': {e}")


def seed_reference_data(db: Session) -> None:
    """
    Seeds initial helpline resources, motivational content items, and achievement badges.
    Idempotent operation: skips seeding if tables already contain data.
    """
    logger.info("Starting reference data seeding check...")

    # 1. Seed Helpline Resources (IN, US, UK)
    existing_helplines = db.query(HelplineResource).count()
    if existing_helplines < 9:
        logger.info("Seeding default emergency helpline resources for IN, US, UK...")
        db.query(HelplineResource).delete()
        initial_helplines = [
            # India (IN)
            HelplineResource(
                country_code="IN",
                name="Tele-MANAS (Mental Health Helpline)",
                phone_number="14416",
                description="National tele-mental health service providing 24/7 free care across India.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="IN",
                name="KIRAN Mental Health Rehabilitation",
                phone_number="1800-599-0019",
                description="Government of India helpline for psychological support and distress management.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="IN",
                name="Vandrevala Foundation",
                phone_number="9999 666 555",
                description="24/7 mental health counseling and crisis support line.",
                available_hours="24/7",
                is_active=True,
            ),
            # United States (US)
            HelplineResource(
                country_code="US",
                name="988 Suicide & Crisis Lifeline",
                phone_number="988",
                description="Free 24/7 confidential support for anyone in suicidal crisis or emotional distress in the US.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="US",
                name="Crisis Text Line",
                phone_number="741741",
                description="Free, 24/7 text line support for individuals in crisis across the United States.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="US",
                name="SAMHSA National Helpline",
                phone_number="1-800-662-4357",
                description="Substance Abuse and Mental Health Services Administration treatment referral helpline.",
                available_hours="24/7",
                is_active=True,
            ),
            # United Kingdom (UK)
            HelplineResource(
                country_code="UK",
                name="Samaritans UK",
                phone_number="116 123",
                description="Confidential, non-judgmental emotional support available 24 hours a day in the UK.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="UK",
                name="NHS Urgent Mental Health Services",
                phone_number="111",
                description="Free 24/7 NHS medical helpline for urgent mental health assessment and advice.",
                available_hours="24/7",
                is_active=True,
            ),
            HelplineResource(
                country_code="UK",
                name="Mind Infoline",
                phone_number="0300 123 3393",
                description="Provides information on mental health types, where to get help, and advocacy in the UK.",
                available_hours="9am-6pm Mon-Fri",
                is_active=True,
            ),
        ]
        db.add_all(initial_helplines)
        db.commit()
        logger.info(f"Added {len(initial_helplines)} helpline resources for IN, US, and UK.")
    else:
        logger.info(f"Skipping helpline seeding ({existing_helplines} records present).")

    # 2. Seed Motivational Content Items (Clean Reference Data)
    existing_content = db.query(ContentItem).count()
    if existing_content == 0:
        logger.info("Seeding clean reference motivational content items...")
        initial_content = [
            ContentItem(
                type=ContentType.AFFIRMATION,
                text="Like Kintsugi, my scars and struggles make me stronger, unique, and resilient.",
                category="resilience",
                is_active=True,
            ),
            ContentItem(
                type=ContentType.QUOTE,
                text="The wound is the place where the Light enters you. — Rumi",
                category="hope",
                is_active=True,
            ),
            ContentItem(
                type=ContentType.TIP,
                text="Take 5 slow, deep breaths: inhale for 4 seconds, hold for 4, exhale for 6.",
                category="mindfulness",
                is_active=True,
            ),
        ]
        db.add_all(initial_content)
        logger.info(f"Added {len(initial_content)} reference content items.")
    else:
        logger.info(f"Skipping content seeding ({existing_content} records present).")

    # 3. Seed Master Achievement Catalog
    existing_achievements = db.query(Achievement).count()
    if existing_achievements == 0:
        logger.info("Seeding master achievement catalog...")
        initial_achievements = [
            Achievement(
                code="first_mood_logged",
                title="First Step to Healing",
                description="Complete your first daily mood check-in.",
                icon_url="heart",
            ),
            Achievement(
                code="first_journal_entry",
                title="Vault Sentinel",
                description="Write your first encrypted journal entry.",
                icon_url="book",
            ),
            Achievement(
                code="wellness_seeker",
                title="Deep Reflection Scholar",
                description="Write 10 or more encrypted journal entries.",
                icon_url="shield",
            ),
            Achievement(
                code="companion_chatter",
                title="AI Companion Voice",
                description="Engage in 5 or more AI Companion support conversations.",
                icon_url="sparkles",
            ),
            Achievement(
                code="7_day_streak",
                title="7-Day Consistency Streak",
                description="Maintain a 7-day continuous daily check-in streak.",
                icon_url="trophy",
            ),
            Achievement(
                code="30_day_streak",
                title="30-Day Mindfulness Champion",
                description="Maintain a 30-day continuous daily check-in streak.",
                icon_url="star",
            ),
            Achievement(
                code="100_day_streak",
                title="Centennial Zen Master",
                description="Maintain a 100-day continuous daily check-in streak.",
                icon_url="crown",
            ),
        ]
        db.add_all(initial_achievements)
        logger.info(f"Added {len(initial_achievements)} master achievement catalog items.")
    else:
        logger.info(f"Skipping achievement seeding ({existing_achievements} records present).")

    db.commit()
    logger.info("Reference data seeding complete.")


def init_db(db: Session = None) -> None:
    """
    Main application database initialization entrypoint.
    Executes connectivity verification, auto-schema migration, and conditional development seeding.
    """
    if db is None:
        from app.db.session import SessionLocal
        with SessionLocal() as session:
            init_db(session)
            return

    logger.info("==================================================")
    logger.info("Initializing Kintsugi Backend Database Layer")
    logger.info("==================================================")

    # 1. Verify Connectivity
    if not verify_db_connection(db):
        raise RuntimeError("Database connectivity check failed during startup initialization.")

    # 2. Ensure all ORM tables are created
    try:
        logger.info("Ensuring database tables exist...")
        Base.metadata.create_all(bind=db.bind)
        logger.info("Database tables initialized/verified.")
    except Exception as create_err:
        logger.warning(f"Note during table creation: {create_err}")

    # 3. Auto-patch Schema Columns
    ensure_schema_columns(db)

    # 3. Idempotent Reference Seeding (Development Mode)
    if settings.ENV.lower() in ["development", "dev", "local"]:
        try:
            seed_reference_data(db)
        except SQLAlchemyError as err:
            db.rollback()
            logger.error(f"Error seeding reference data, rolled back: {err}")
            raise RuntimeError("Database reference data seeding failed") from err
    else:
        logger.info(f"Skipping dev reference seeding in '{settings.ENV}' environment.")

    logger.info("Database initialization completed successfully.")
