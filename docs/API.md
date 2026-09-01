# REST API Specification & Endpoint Documentation

All requests should be prefixed with `/api/v1`.

---

## Authentication Endpoints

### 1. Register Account
- **`POST /api/v1/auth/register`**
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "token_type": "Bearer",
    "user": { "id": 1, "email": "jane@example.com", "name": "Jane Doe" }
  }
  ```

### 2. Login Account
- **`POST /api/v1/auth/login`**
- **Request Body**: `{"email": "jane@example.com", "password": "SecurePassword123!"}`

### 3. Forgot Password Request
- **`POST /api/v1/auth/forgot-password`**
- **Request Body**: `{"email": "jane@example.com"}`
- **Response `200 OK`**: `{"success": true, "message": "If an account exists, a verification code has been sent."}`

### 4. Verify Password Reset OTP
- **`POST /api/v1/auth/verify-reset-otp`**
- **Request Body**: `{"email": "jane@example.com", "otp": "582731"}`
- **Response `200 OK`**: `{"verified": true, "reset_token": "eyJhbGci..."}`

### 5. Reset Password
- **`POST /api/v1/auth/reset-password`**
- **Request Body**: `{"reset_token": "eyJhbGci...", "new_password": "NewStrongPassword123!"}`
- **Response `200 OK`**: `{"success": true, "message": "Password updated successfully."}`

---

## Mood Tracking Endpoints

- **`GET /api/v1/mood/history`** (Auth Required) — List past mood entries.
- **`POST /api/v1/mood/log`** (Auth Required) — Log a new mood entry.

---

## Journal Endpoints

- **`GET /api/v1/journal/entries`** (Auth Required) — List user journal reflections.
- **`POST /api/v1/journal/entries`** (Auth Required) — Create encrypted journal entry.
