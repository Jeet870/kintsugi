# Database Architecture & Relational Schema Documentation

## Database Specifications

- **Database Engine**: MariaDB 10.4+ / MySQL 8.0+
- **Default Database Name**: `kintsugi_db`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

---

## Core Tables & Descriptions

1. `users` — Primary account table holding name, email, hashed credentials, theme, and security timestamps.
2. `password_reset_requests` — Tracks OTP codes, SHA-256 hashes, expiration dates, attempt counts, and lifecycle status (`PENDING`, `VERIFIED`, `USED`, `EXPIRED`, `BLOCKED`).
3. `password_history` — Stores previous password hashes to prevent password reuse (last 5 passwords).
4. `security_audit_logs` — Comprehensive audit log of authentication and security actions.
5. `mood_entries` — Relational table for tracking user emotional mood scores (1-5), mood tags, and energy.
6. `journal_entries` — Stores encrypted user reflections with title, body text, AI reflections, and favorite/pinned flags.
7. `chat_sessions` & `chat_messages` — AI companion conversational sessions and message history.
8. `notifications` — System notification delivery state.
9. `refresh_tokens` — Refresh token tracking for remote session revocation.
