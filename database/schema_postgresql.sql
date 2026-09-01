-- =============================================================================
-- Kintsugi Mental Health & Wellness Companion
-- PostgreSQL Database Schema (PostgreSQL 14+ with pgvector support)
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop existing tables in reverse dependency order if recreating
DROP TABLE IF EXISTS security_audit_logs CASCADE;
DROP TABLE IF EXISTS password_history CASCADE;
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS helpline_resources CASCADE;
DROP TABLE IF EXISTS daily_motivations CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS mood_streaks CASCADE;
DROP TABLE IF EXISTS crisis_logs CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS journal_embeddings CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS mood_entries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop Enums if exist
DROP TYPE IF EXISTS theme_preference_enum CASCADE;
DROP TYPE IF EXISTS mood_type_enum CASCADE;
DROP TYPE IF EXISTS chat_status_enum CASCADE;
DROP TYPE IF EXISTS sender_enum CASCADE;
DROP TYPE IF EXISTS content_type_enum CASCADE;
DROP TYPE IF EXISTS reset_status_enum CASCADE;

-- Define Enums
CREATE TYPE theme_preference_enum AS ENUM ('light', 'dark');
CREATE TYPE mood_type_enum AS ENUM ('happy', 'calm', 'sad', 'angry', 'anxious', 'tired');
CREATE TYPE chat_status_enum AS ENUM ('active', 'closed', 'escalated');
CREATE TYPE sender_enum AS ENUM ('user', 'ai', 'system');
CREATE TYPE content_type_enum AS ENUM ('quote', 'affirmation', 'tip');
CREATE TYPE reset_status_enum AS ENUM ('PENDING', 'VERIFIED', 'USED', 'EXPIRED', 'BLOCKED');

-- =============================================================================
-- 1. users
-- Root entity with UUID generation and preferences
-- =============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    theme_preference theme_preference_enum NOT NULL DEFAULT 'dark',
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL DEFAULT NULL,
    password_changed_at TIMESTAMPTZ NULL DEFAULT NULL,
    failed_reset_attempts INT NOT NULL DEFAULT 0,
    last_password_reset TIMESTAMPTZ NULL DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_uuid ON users (uuid);
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- =============================================================================
-- 2. mood_entries
-- Interactive mood logs with ML sentiment scores
-- =============================================================================
CREATE TABLE mood_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_type mood_type_enum NOT NULL,
    note TEXT NULL,
    ai_message TEXT NULL,
    sentiment_valence DOUBLE PRECISION NULL DEFAULT 0.0,
    sentiment_arousal DOUBLE PRECISION NULL DEFAULT 0.0,
    emotions_json JSONB NULL DEFAULT '{}'::jsonb,
    entry_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mood_entries_user_id ON mood_entries (user_id);
CREATE INDEX idx_mood_entries_user_entry_date ON mood_entries (user_id, entry_date);

-- =============================================================================
-- 3. journal_entries & journal_embeddings
-- Encrypted journal reflections with pgvector semantic search support
-- =============================================================================
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    mood_tag VARCHAR(50) NULL DEFAULT 'Calm',
    ai_reflection TEXT NULL,
    ai_summary TEXT NULL,
    ai_title VARCHAR(255) NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entries_user_id ON journal_entries (user_id);

CREATE TABLE journal_embeddings (
    id BIGSERIAL PRIMARY KEY,
    journal_id BIGINT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    embedding VECTOR(384) NULL, -- SentenceTransformers 384-dim vector
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_embeddings_user ON journal_embeddings (user_id);

-- =============================================================================
-- 4. chat_sessions & chat_messages
-- Conversational AI sessions with ML crisis flagging
-- =============================================================================
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NULL,
    status chat_status_enum NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ NULL DEFAULT NULL
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions (user_id);

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender sender_enum NOT NULL,
    content TEXT NOT NULL,
    flagged_crisis BOOLEAN NOT NULL DEFAULT FALSE,
    risk_score DOUBLE PRECISION NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages (session_id);
CREATE INDEX idx_chat_messages_session_created ON chat_messages (session_id, created_at);

-- =============================================================================
-- 5. crisis_logs
-- ML crisis detection audit trail
-- =============================================================================
CREATE TABLE crisis_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    session_id BIGINT NULL REFERENCES chat_sessions(id) ON DELETE SET NULL,
    message_id BIGINT NULL REFERENCES chat_messages(id) ON DELETE SET NULL,
    trigger_type VARCHAR(100) NOT NULL,
    action_taken VARCHAR(255) NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'MODERATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crisis_logs_user_id ON crisis_logs (user_id);

-- =============================================================================
-- 6. mood_streaks
-- User streak tracking table
-- =============================================================================
CREATE TABLE mood_streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_logged_date DATE NULL DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. achievements & user_achievements
-- Badges and rewards catalog
-- =============================================================================
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon_url VARCHAR(500) NULL
);

CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements (user_id);

-- =============================================================================
-- 8. content_items, daily_motivations & helpline_resources
-- =============================================================================
CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    type content_type_enum NOT NULL,
    text TEXT NOT NULL,
    category VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE daily_motivations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_date DATE NOT NULL,
    quote TEXT NOT NULL,
    quote_author VARCHAR(255) NOT NULL DEFAULT 'Kintsugi AI',
    quote_category VARCHAR(100) NOT NULL DEFAULT 'hope',
    affirmations JSONB NOT NULL DEFAULT '[]'::jsonb,
    self_care_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_daily_motivation UNIQUE (user_id, content_date)
);

CREATE TABLE helpline_resources (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(5) NOT NULL DEFAULT 'IN',
    name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    description VARCHAR(255) NULL,
    available_hours VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- 9. Security & Recovery Tables
-- =============================================================================
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    category VARCHAR(100) NULL DEFAULT 'general',
    scheduled_at TIMESTAMPTZ NULL DEFAULT NULL,
    sent_at TIMESTAMPTZ NULL DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    status reset_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ NULL DEFAULT NULL,
    used_at TIMESTAMPTZ NULL DEFAULT NULL,
    ip_address VARCHAR(45) NULL DEFAULT NULL,
    user_agent VARCHAR(255) NULL DEFAULT NULL
);

CREATE TABLE password_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL DEFAULT NULL,
    user_agent VARCHAR(255) NULL DEFAULT NULL,
    details TEXT NULL DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- POSTGRESQL TRIGGERS & FUNCTIONS
-- =============================================================================

-- Trigger Function 1: Auto-create mood_streaks on new user signup
CREATE OR REPLACE FUNCTION fn_create_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO mood_streaks (user_id, current_streak, longest_streak, last_logged_date)
    VALUES (NEW.id, 0, 0, NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_user_insert
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION fn_create_user_streak();

-- Trigger Function 2: Update session status to escalated if crisis message inserted
CREATE OR REPLACE FUNCTION fn_escalate_crisis_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.flagged_crisis = TRUE THEN
        UPDATE chat_sessions
           SET status = 'escalated'
         WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_chat_message_insert_crisis
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION fn_escalate_crisis_session();
