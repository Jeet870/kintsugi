-- =============================================================================
-- Kintsugi Mental Health & Wellness Companion
-- Database Schema (MySQL 8.0+)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `kintsugi_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `kintsugi_db`;

-- Disable Foreign Key checks during schema creation / drop
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `security_audit_logs`;
DROP TABLE IF EXISTS `password_history`;
DROP TABLE IF EXISTS `password_reset_requests`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `helpline_resources`;
DROP TABLE IF EXISTS `daily_motivations`;
DROP TABLE IF EXISTS `content_items`;
DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `mood_streaks`;
DROP TABLE IF EXISTS `crisis_logs`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `chat_sessions`;
DROP TABLE IF EXISTS `journal_entries`;
DROP TABLE IF EXISTS `mood_entries`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 5.1 users
-- Root entity; every other user-scoped table carries a user_id FK to this table.
-- =============================================================================
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `theme_preference` ENUM('light', 'dark') NOT NULL DEFAULT 'light',
    `notification_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `password_changed_at` TIMESTAMP NULL DEFAULT NULL,
    `failed_reset_attempts` INT NOT NULL DEFAULT 0,
    `last_password_reset` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_uuid` (`uuid`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.2 mood_entries
-- Multiple entries per day permitted; entry_date drives streak logic.
-- =============================================================================
CREATE TABLE `mood_entries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `mood_type` ENUM('happy', 'calm', 'sad', 'angry', 'anxious', 'tired') NOT NULL,
    `note` TEXT NULL,
    `ai_message` TEXT NULL,
    `entry_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_mood_entries_user_id` (`user_id`),
    KEY `idx_mood_entries_user_entry_date` (`user_id`, `entry_date`),
    CONSTRAINT `fk_mood_entries_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.3 journal_entries
-- content is ciphertext; encrypted at application level.
-- =============================================================================
CREATE TABLE `journal_entries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `mood_tag` VARCHAR(50) NULL DEFAULT 'Calm',
    `ai_reflection` TEXT NULL,
    `ai_summary` TEXT NULL,
    `ai_title` VARCHAR(255) NULL,
    `is_favorite` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_encrypted` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_journal_entries_user_id` (`user_id`),
    CONSTRAINT `fk_journal_entries_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.4 chat_sessions
-- Groups AI companion conversations and flags escalations.
-- =============================================================================
CREATE TABLE `chat_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NULL,
    `status` ENUM('active', 'closed', 'escalated') NOT NULL DEFAULT 'active',
    `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_chat_sessions_user_id` (`user_id`),
    CONSTRAINT `fk_chat_sessions_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.5 chat_messages
-- Stores transcripts; flagged_crisis set synchronously on safety triggers.
-- =============================================================================
CREATE TABLE `chat_messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT NOT NULL,
    `sender` ENUM('user', 'ai', 'system') NOT NULL,
    `content` TEXT NOT NULL,
    `flagged_crisis` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_chat_messages_session_id` (`session_id`),
    KEY `idx_chat_messages_session_created` (`session_id`, `created_at`),
    CONSTRAINT `fk_chat_messages_sessions` 
        FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.6 crisis_logs
-- Decoupled safety audit trail. Retained independently for safety auditing.
-- =============================================================================
CREATE TABLE `crisis_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `session_id` BIGINT NULL DEFAULT NULL,
    `message_id` BIGINT NULL DEFAULT NULL,
    `trigger_type` VARCHAR(100) NOT NULL,
    `action_taken` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_crisis_logs_user_id` (`user_id`),
    KEY `idx_crisis_logs_session_id` (`session_id`),
    KEY `idx_crisis_logs_message_id` (`message_id`),
    CONSTRAINT `fk_crisis_logs_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_crisis_logs_sessions` 
        FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_crisis_logs_messages` 
        FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.7 mood_streaks
-- One-to-one with users; updated on log and nightly sweep.
-- =============================================================================
CREATE TABLE `mood_streaks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `current_streak` INT NOT NULL DEFAULT 0,
    `longest_streak` INT NOT NULL DEFAULT 0,
    `last_logged_date` DATE NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_mood_streaks_user_id` (`user_id`),
    CONSTRAINT `fk_mood_streaks_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.8 achievements
-- Catalog table containing stable badge codes.
-- =============================================================================
CREATE TABLE `achievements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `icon_url` VARCHAR(500) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_achievements_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.9 user_achievements
-- Join table for awarded achievements.
-- =============================================================================
CREATE TABLE `user_achievements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `achievement_id` BIGINT NOT NULL,
    `earned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_achievements_user_id` (`user_id`),
    KEY `idx_user_achievements_achievement_id` (`achievement_id`),
    UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
    CONSTRAINT `fk_user_achievements_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_user_achievements_achievements` 
        FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.10 content_items
-- Read-heavy motivational content.
-- =============================================================================
CREATE TABLE `content_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('quote', 'affirmation', 'tip') NOT NULL,
    `text` TEXT NOT NULL,
    `category` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`id`),
    KEY `idx_content_items_type_active` (`type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.11 daily_motivations
-- Persists automated daily motivation bundles (quote, affirmations, tips) per user per calendar day.
-- =============================================================================
CREATE TABLE `daily_motivations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `content_date` DATE NOT NULL,
    `quote` TEXT NOT NULL,
    `quote_author` VARCHAR(255) NOT NULL DEFAULT 'Kintsugi AI',
    `quote_category` VARCHAR(100) NOT NULL DEFAULT 'hope',
    `affirmations` JSON NOT NULL,
    `self_care_tips` JSON NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_daily_motivation` (`user_id`, `content_date`),
    KEY `idx_daily_motivation_user_date` (`user_id`, `content_date`),
    CONSTRAINT `fk_daily_motivations_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.12 helpline_resources
-- Emergency assistance resources.
-- =============================================================================
CREATE TABLE `helpline_resources` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `country_code` VARCHAR(5) NOT NULL DEFAULT 'IN',
    `name` VARCHAR(150) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `description` VARCHAR(255) NULL,
    `available_hours` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`id`),
    KEY `idx_helpline_resources_country_active` (`country_code`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.13 refresh_tokens
-- Stores hashed refresh tokens for session management.
-- =============================================================================
CREATE TABLE `refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_refresh_tokens_user_id` (`user_id`),
    KEY `idx_refresh_tokens_token_hash` (`token_hash`),
    CONSTRAINT `fk_refresh_tokens_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.14 notifications
-- Queue table consumed by notification workers.
-- =============================================================================
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `body` VARCHAR(500) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `category` VARCHAR(100) NULL DEFAULT 'general',
    `scheduled_at` TIMESTAMP NULL DEFAULT NULL,
    `sent_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_scheduled_sent` (`scheduled_at`, `sent_at`),
    CONSTRAINT `fk_notifications_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.15 password_reset_requests
-- Secure password reset OTP request tracking table.
-- =============================================================================
CREATE TABLE `password_reset_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `attempts` INT NOT NULL DEFAULT 0,
    `max_attempts` INT NOT NULL DEFAULT 5,
    `status` ENUM('PENDING', 'VERIFIED', 'USED', 'EXPIRED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `verified_at` TIMESTAMP NULL DEFAULT NULL,
    `used_at` TIMESTAMP NULL DEFAULT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` VARCHAR(255) NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_pwd_reset_email` (`email`),
    KEY `idx_pwd_reset_user_id` (`user_id`),
    KEY `idx_pwd_reset_expires_status` (`expires_at`, `status`),
    CONSTRAINT `fk_pwd_reset_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.16 password_history
-- Enforces password history to prevent password reuse (last 5 passwords).
-- =============================================================================
CREATE TABLE `password_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_password_history_user_id` (`user_id`),
    CONSTRAINT `fk_password_history_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5.17 security_audit_logs
-- Comprehensive audit trail for security operations.
-- =============================================================================
CREATE TABLE `security_audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL DEFAULT NULL,
    `action` VARCHAR(100) NOT NULL,
    `ip_address` VARCHAR(45) NULL DEFAULT NULL,
    `user_agent` VARCHAR(255) NULL DEFAULT NULL,
    `details` TEXT NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_security_audit_logs_user_id` (`user_id`),
    KEY `idx_security_audit_logs_action` (`action`),
    CONSTRAINT `fk_security_audit_users` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DATABASE TRIGGERS
-- =============================================================================

DELIMITER $$

-- Trigger 1: Auto-create mood_streaks row upon new user creation
DROP TRIGGER IF EXISTS `trg_after_user_insert`$$
CREATE TRIGGER `trg_after_user_insert`
AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `mood_streaks` (`user_id`, `current_streak`, `longest_streak`, `last_logged_date`)
    VALUES (NEW.id, 0, 0, NULL);
END$$

-- Trigger 2: Auto-recalculate streak state on mood log entry
DROP TRIGGER IF EXISTS `trg_after_mood_entry_insert`$$
CREATE TRIGGER `trg_after_mood_entry_insert`
AFTER INSERT ON `mood_entries`
FOR EACH ROW
BEGIN
    DECLARE v_last_date DATE;
    DECLARE v_current INT DEFAULT 0;
    DECLARE v_longest INT DEFAULT 0;

    SELECT `last_logged_date`, `current_streak`, `longest_streak`
      INTO v_last_date, v_current, v_longest
      FROM `mood_streaks`
     WHERE `user_id` = NEW.user_id;

    IF v_last_date IS NULL THEN
        SET v_current = 1;
        SET v_last_date = NEW.entry_date;
    ELSEIF NEW.entry_date = DATE_ADD(v_last_date, INTERVAL 1 DAY) THEN
        SET v_current = v_current + 1;
        SET v_last_date = NEW.entry_date;
    ELSEIF NEW.entry_date > DATE_ADD(v_last_date, INTERVAL 1 DAY) THEN
        SET v_current = 1;
        SET v_last_date = NEW.entry_date;
    END IF;

    IF v_current > v_longest THEN
        SET v_longest = v_current;
    END IF;

    UPDATE `mood_streaks`
       SET `current_streak` = v_current,
           `longest_streak` = v_longest,
           `last_logged_date` = v_last_date
     WHERE `user_id` = NEW.user_id;
END$$

-- Trigger 3: Escalate session status if a crisis message is inserted
DROP TRIGGER IF EXISTS `trg_after_chat_message_insert_crisis`$$
CREATE TRIGGER `trg_after_chat_message_insert_crisis`
AFTER INSERT ON `chat_messages`
FOR EACH ROW
BEGIN
    IF NEW.flagged_crisis = TRUE THEN
        UPDATE `chat_sessions`
           SET `status` = 'escalated'
         WHERE `id` = NEW.session_id;
    END IF;
END$$

DELIMITER ;
