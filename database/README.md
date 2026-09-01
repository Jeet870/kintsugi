# Kintsugi Database Specifications & Relational Schema

The Kintsugi database engine is built on **MariaDB 10.4+ / MySQL 8.0+** utilizing relational tables, foreign key constraints, indexes, and full UTF-8 (`utf8mb4`) character encoding.

---

## Relational Entity Schema (`schema.sql`)

- `users`: Core user accounts, auth credentials (`password_hash`), preferences, theme, and security metadata (`password_changed_at`, `failed_reset_attempts`, `last_password_reset`).
- `password_reset_requests`: Tracks 6-digit numeric OTP requests, SHA-256 hashed codes, 10-minute expirations, attempts counters, and status (`PENDING`, `VERIFIED`, `USED`, `EXPIRED`, `BLOCKED`).
- `password_history`: Stores previous password hashes per user to enforce 5-password history rules.
- `security_audit_logs`: Audit log of security actions (IP address, user agent, action timestamps).
- `mood_entries`: User mood logs, 5-point scale score, mood tags, energy level, notes.
- `journal_entries`: Journal reflections with Fernet encrypted body text, AI reflections, favorite/pin flags.
- `chat_sessions` & `chat_messages`: Asynchronous LLM conversational sessions and message history.
- `notifications`: User notification delivery status and category tags.
- `refresh_tokens`: Cryptographic refresh token storage with revocation support.
- `crisis_logs`: Crisis detection events and emergency helpline interactions.
- `achievements` & `user_achievements`: Gamified wellness milestones and user unlocks.

---

## Migration & Execution Order

To initialize or reset the database:

```bash
# Using MySQL Command Line Client
mysql -u root -p kintsugi_db < database/schema.sql

# Or using Python SQLAlchemy automatic table creation
python -c "from app.db.session import engine; from app.db.base_class import Base; import app.models; Base.metadata.create_all(bind=engine)"
```
