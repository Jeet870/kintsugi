# Kintsugi Release Process & Distribution Guide

This document outlines the versioning, build artifacts, release verification, and Play Store / Web deployment processes for Kintsugi.

## Release Cadence & Versioning Scheme

Kintsugi uses **Semantic Versioning (MAJOR.MINOR.PATCH)**:
- `MAJOR`: Breaking API contract changes or architectural shifts.
- `MINOR`: New user-facing features or major component additions.
- `PATCH`: Security fixes, performance optimization, and bug fixes.

---

## Pre-Release Quality Checklist

Before building release artifacts:
1. **Clean Code & Lint Check**:
   - Web: `cd web && npm run lint`
   - Backend: `cd backend && flake8 .`
   - Android: `cd frontend && ./gradlew lintDebug`
2. **Automated Unit & Integration Tests**:
   - Backend: `pytest`
   - Android: `./gradlew test`
   - Web: `npm test`
3. **Database Migration Verification**: Ensure `schema.sql` is in sync with SQLAlchemy ORM models.
4. **Environment Security**: Verify zero credentials or private keys committed to Git.

---

## Building Release Artifacts

### 1. Web Production Bundle
```bash
cd web
npm run build
```
Generates production static assets in `web/dist/`.

### 2. Android Release APK & App Bundle (AAB)
```bash
cd frontend
./gradlew assembleRelease
./gradlew bundleRelease
```
Outputs:
- Signed Release APK: `frontend/app/build/outputs/apk/release/app-release.apk`
- Google Play App Bundle: `frontend/app/build/outputs/bundle/release/app-release.aab`

---

## Deployment Channels

- **Web Application**: Deployed via Docker or static host (Vercel / Netlify).
- **Backend API**: Deployed via FastAPI + Uvicorn + Celery + Redis + MariaDB/MySQL.
- **Android App**: Distributed via Google Play Store (Internal Testing -> Closed Beta -> Production Track).
