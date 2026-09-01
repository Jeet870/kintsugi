import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import create_app
from app.api.deps import get_db
from app.models import Base, ContentItem, HelplineResource, Achievement
from app.core.constants import ContentType


@pytest.fixture(scope="session")
def engine():
    engine_obj = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine_obj)
    return engine_obj


@pytest.fixture(scope="session")
def TestingSessionLocal(engine):
    return sessionmaker(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine, TestingSessionLocal):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed reference data idempotently
    if not session.query(ContentItem).first():
        quote = ContentItem(type=ContentType.QUOTE, text="Hope is the thing with feathers", category="inspiration", is_active=True)
        tip = ContentItem(type=ContentType.TIP, text="Take 3 deep breaths", category="mindfulness", is_active=True)
        helpline = HelplineResource(country_code="IN", name="Vandrevala Foundation", phone_number="9999666555", available_hours="24/7", is_active=True)
        badge = Achievement(code="first_mood_logged", title="First Mood", description="Logged first mood", icon_url="icon.png")

        session.add_all([quote, tip, helpline, badge])
        session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    app = create_app()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
