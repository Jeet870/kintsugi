# Security Policy & Vulnerability Disclosure

Kintsugi takes user privacy, emotional data confidentiality, and system security extremely seriously.
As a mental health sanctuary application, protecting encrypted journal entries, user accounts, and real-time communications is our top priority.

---

## Supported Versions

Security updates are actively maintained for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability or security flaw within Kintsugi (Backend, Web, Android, or Database layer), **please DO NOT open a public GitHub issue**.

Instead, please report the vulnerability privately via:
- **Email**: `security@kintsugi.example.com` or `app.services.v1@gmail.com`
- **Subject**: `[SECURITY VULNERABILITY] <Brief Description>`

### Please Include in Your Report:
1. Type of vulnerability (e.g., SQL Injection, CSRF, Token Leakage, Auth Bypass).
2. Step-by-step instructions or Proof of Concept (PoC) script to reproduce the issue.
3. Affected components (Backend API, Web client, or Android APK).
4. Any potential impact on user data confidentiality.

### Our Commitment:
- We will acknowledge receipt of your vulnerability report within **24 hours**.
- We will provide an estimated timeline for remediation within **72 hours**.
- Once a fix is verified and released, credit will be given in our Release Notes (if desired).

---

## Built-In Security Safeguards

- **End-to-End Encrypted Journaling**: Symmetric Fernet payload encryption for private user reflections.
- **Zero Email Enumeration**: Password reset requests return generic success messages to prevent account scanning.
- **OTP Security**: 6-digit numeric OTPs stored as SHA-256 hashes with 10-minute expiration and 5-attempt brute-force protection.
- **Session Revocation**: Resetting a password automatically revokes all active refresh tokens across devices.
- **Password History Rules**: Enforces complex password requirements and blocks reuse of the last 5 passwords.
- **Strict Transport Security**: Enforces HTTPS/WSS communication in production environments.
