"""
Security Cryptographic Utilities.
Provides Fernet symmetric encryption/decryption for sensitive data (journal entries)
and salted SHA256 constant-time token hashing for refresh token storage.
"""
import base64
import hashlib
import hmac
import secrets
import string
import logging
from cryptography.fernet import Fernet

from app.core.config import settings

logger = logging.getLogger("kintsugi.utils.security")


def generate_random_token(length: int = 32) -> str:
    """
    Generates a cryptographically secure random alphanumeric string.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _get_fernet_key() -> bytes:
    """
    Derives a valid 32-byte URL-safe base64 key from application SECRET_KEY.
    """
    secret = settings.SECRET_KEY.encode("utf-8")
    key_bytes = hashlib.sha256(secret).digest()
    return base64.urlsafe_b64encode(key_bytes)


def encrypt_text(plaintext: str) -> str:
    """
    Encrypts plaintext string into a Fernet ciphertext string using application secret key.
    """
    if not plaintext:
        return ""
    try:
        fernet = Fernet(_get_fernet_key())
        encrypted = fernet.encrypt(plaintext.encode("utf-8"))
        return encrypted.decode("utf-8")
    except Exception as err:
        logger.error(f"Encryption failed: {err}")
        raise ValueError("Failed to encrypt text content") from err


# Alias for backward compatibility
encrypt_content = encrypt_text


def decrypt_text(ciphertext: str) -> str:
    """
    Decrypts Fernet ciphertext string back to plaintext.
    Returns original string if content is unencrypted legacy text.
    """
    if not ciphertext:
        return ""
    try:
        fernet = Fernet(_get_fernet_key())
        decrypted = fernet.decrypt(ciphertext.encode("utf-8"))
        return decrypted.decode("utf-8")
    except Exception:
        # Fallback if content was stored unencrypted
        return ciphertext


# Alias for backward compatibility
decrypt_content = decrypt_text


def hash_token(token: str) -> str:
    """
    Computes a salted SHA256 hex digest of a refresh token for database storage.
    """
    if not token:
        return ""
    salted = f"{settings.SECRET_KEY}:{token}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def verify_token(token: str, stored_hash: str) -> bool:
    """
    Verifies a plaintext refresh token against a stored hash using constant-time comparison.
    """
    if not token or not stored_hash:
        return False
    computed_hash = hash_token(token)
    return hmac.compare_digest(computed_hash, stored_hash)
