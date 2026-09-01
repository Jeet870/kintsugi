# Testing Strategy & Execution Guide

Kintsugi uses unit, integration, and UI verification testing across all three modules.

---

## 1. Backend Testing (Pytest)

Run backend tests using Pytest:
```bash
cd backend
.\venv\Scripts\activate
pytest
```

### Key Test Suites:
- `tests/test_auth.py`: Tests user registration, login, JWT token issuance, and password recovery OTP generation.
- `tests/test_journal.py`: Tests Fernet payload encryption and decryption.

---

## 2. Android Testing (JUnit & Espresso)

Run Kotlin unit tests and Android Instrumentation tests:
```bash
cd frontend
./gradlew test
./gradlew connectedAndroidTest
```

---

## 3. Web Testing (Vitest & Playwright)

Run Web unit tests:
```bash
cd web
npm test
```
