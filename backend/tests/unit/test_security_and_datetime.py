from datetime import date
from app.utils.security_utils import encrypt_text, decrypt_text, hash_token, verify_token
from app.utils.datetime_utils import utcnow, local_today, days_between
from app.ai.base import AIProvider
from app.services.ai_service import AIService


def test_fernet_encryption_decryption():
    raw = "Secret journal entry content"
    encrypted = encrypt_text(raw)
    assert encrypted != raw
    assert decrypt_text(encrypted) == raw


def test_refresh_token_hashing_and_verification():
    token = "sample_refresh_token_xyz_987"
    hashed = hash_token(token)
    assert verify_token(token, hashed) is True
    assert verify_token("invalid_token", hashed) is False


def test_datetime_helpers():
    now_dt = utcnow()
    assert now_dt.tzinfo is not None

    today_dt = local_today("Asia/Kolkata")
    assert isinstance(today_dt, date)

    d_diff = days_between(date(2026, 1, 1), date(2026, 1, 15))
    assert d_diff == 14


def test_ai_provider_dependency_inversion():
    class CustomProvider(AIProvider):
        def generate_completion(self, messages, system_prompt=None, temperature=None, max_tokens=None):
            return "Mocked vendor completion"

    service = AIService(provider=CustomProvider())
    reply = service.generate_chat_reply(messages=[{"role": "user", "content": "Test"}])
    assert reply == "Mocked vendor completion"
