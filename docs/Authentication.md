# Authentication & Password Recovery Flow Specification

## Architectural Overview

Kintsugi uses a dual security architecture:
1. **OAuth2 Bearer Tokens**: Short-lived JWT Access Tokens (30 minutes) + Persistent Refresh Tokens (7 days).
2. **Password Recovery Engine**: Rate-limited, zero-enumeration 4-step recovery system with 6-digit numeric OTPs, SHA-256 OTP hashing, temporary JWT reset tokens, and historical password tracking.

---

## Complete Password Reset Flow

```
Forgot Password Screen
       │
       ▼
1. Enter Email Address ──────► POST /auth/forgot-password
                                      │
                                      ▼
                               Rate Limit Check (Max 3 req / 30m)
                               Generate 6-Digit Cryptographic OTP
                               Store SHA-256 Hash with 10-min Exp
                               Send HTML Email via Gmail SMTP
                               Return 200 OK Generic Response
                                      │
                                      ▼
2. Enter OTP Code ───────────► POST /auth/verify-reset-otp
                                      │
                                      ▼
                               Validate Attempt Count (< 5)
                               Compare SHA-256 Input Hash
                               Mark Request Status: VERIFIED
                               Issue 10-min Reset Token JWT
                                      │
                                      ▼
3. Enter New Password ────────► POST /auth/reset-password
                                      │
                                      ▼
                               Verify Password Complexity (12+ chars)
                               5-Password History Check
                               Update User Password Hash
                               Revoke All Active Refresh Tokens
                               Send Security Notification Email
                                      │
                                      ▼
4. Success & Return to Sign In
```
