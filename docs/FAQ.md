# Frequently Asked Developer & Operational Questions (FAQ)

### Q1: How do I run the entire Kintsugi system locally for the first time?
**A**: Clone the repository and execute our setup automation script:
- Windows PowerShell: `.\scripts\setup.ps1`
- Linux/macOS: `./scripts/setup.sh`

---

### Q2: How does the password recovery OTP system work?
**A**: When a user requests a password reset, the backend generates a cryptographically secure 6-digit numeric OTP, stores a SHA-256 hash with a 10-minute expiration, and sends an HTML email over Gmail SMTP. Once verified, the backend issues a 10-minute JWT reset token used to set a new password.

---

### Q3: Why is Dark Mode enforced globally on Android?
**A**: Kintsugi is designed as a calm mental wellness sanctuary. Light mode resource inflation was disabled (`AppCompatDelegate.MODE_NIGHT_YES`) to prevent sudden brightness shifts during nighttime usage and ensure visual consistency across all components.

---

### Q4: How do I configure real SMTP email delivery?
**A**: Configure your SMTP credentials in `backend/.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="app.services.v1@gmail.com"
SMTP_PASSWORD="your_16_char_app_password"
SMTP_FROM="app.services.v1@gmail.com"
```
