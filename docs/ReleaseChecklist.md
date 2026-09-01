# Pre-Release Quality Verification Checklist

Use this checklist prior to cutting a production release branch:

## 1. Security & Compliance
- [ ] No API keys, passwords, or secret tokens committed to Git.
- [ ] `SECRET_KEY` in `.env` configured to a 32-byte secure random string.
- [ ] Database SSL enabled for production MySQL/MariaDB connections.
- [ ] Password reset endpoints validated for 3 req/30 min rate-limiting and 5-attempt OTP lockouts.

## 2. Backend Verification
- [ ] All database tables in `schema.sql` synchronized with SQLAlchemy ORM models.
- [ ] Swagger API docs at `/docs` rendering without validation errors.
- [ ] Celery tasks (`generate_mood_ai_message`, `deliver_due_notifications`) running without worker crashes.

## 3. Web & Android Verification
- [ ] Web application built cleanly (`npm run build`).
- [ ] Android release APK & AAB generated cleanly (`./gradlew assembleRelease bundleRelease`).
- [ ] Tested Dark Theme rendering on Android physical device.
