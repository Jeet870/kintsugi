<div align="center">

# ✦ Kintsugi (金継ぎ) ✦
### *Mindfulness, Emotional Health & Personal Sanctuary Platform*

[![Android](https://img.shields.io/badge/Android-Kotlin_1.9+-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.11+-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Inspired by the ancient Japanese art of repairing broken pottery with gold, **Kintsugi** illuminates life's repairs. An end-to-end encrypted, low-latency mental health platform featuring real-time conversational AI, encrypted reflection journaling, 5-level mood tracking, cognitive wellness games, and crisis support.*

[Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [Installation](#installation) • [API Documentation](#api-documentation) • [Security](#security)

</div>

---

## 📸 Interface Walkthrough

| **Main Dashboard Sanctuary** | **Encrypted Journal Editor** |
| :---: | :---: |
| ![Dashboard](file:///C:/Users/hp/.gemini/antigravity-ide/brain/deac83d8-d68e-4750-8bcb-c5ce78bc42d8/dashboard_logged_in.png) | ![Journal](file:///C:/Users/hp/.gemini/antigravity-ide/brain/deac83d8-d68e-4750-8bcb-c5ce78bc42d8/journal_final.png) |

| **Password Reset Security Wizard** | **Memory Matrix Mind Game** |
| :---: | :---: |
| ![Password Reset](file:///C:/Users/hp/.gemini/antigravity-ide/brain/deac83d8-d68e-4750-8bcb-c5ce78bc42d8/adb_reverse_screen.png) | ![Mind Game](file:///C:/Users/hp/.gemini/antigravity-ide/brain/deac83d8-d68e-4750-8bcb-c5ce78bc42d8/mind_game_final.png) |

---

## ✨ Features Breakdown

| Feature Module | Description & Highlights | Supported Platforms |
| :--- | :--- | :---: |
| **🤖 AI Companion** | Low-latency streaming conversational support powered by Mistral AI with emotion tagging and non-judgmental guidance. | Web / Android |
| **📊 Mood Tracking** | Interactive 5-level mood logging, streak counters, energy trackers, and custom tag categorization. | Web / Android |
| **📖 Encrypted Journal** | Symmetric Fernet payload encryption, Markdown formatting, AI reflection prompts, PDF & JSON data export. | Web / Android |
| **🔐 Security Recovery** | 4-step password recovery flow with SHA-256 hashed OTPs, 10-min expiration, 5-password history checks, session revocation, and Gmail SMTP delivery. | Web / Android |
| **🧩 Memory Matrix** | Cognitive focus mind game with dynamic score multipliers and particle canvas graphics. | Web / Android |
| **🚨 Emergency SOS** | Immediate crisis support with 120+ country phone selection, direct calling, and crisis escalation protocols. | Web / Android |
| **🫁 Breathing Guide** | Animated 4-7-8 and box breathing relaxation exercises with haptic guidance. | Web / Android |
| **🌙 Dark Sanctuary** | Enforced dark purple mindfulness design system (`AppCompatDelegate.MODE_NIGHT_YES`). | Web / Android |

---

## 🛠 Tech Stack

- **Android Client**: Kotlin 1.9+, Single Activity (`MainActivity`), MVVM, Google Hilt DI, Retrofit 2, OkHttp 4, Coroutines, Flow, Material Design 3, ViewBinding.
- **Web Client**: React 18, TypeScript 5, Vite 5, TailwindCSS 3, Framer Motion, Zustand, React Query, Lucide Icons, Shadcn UI.
- **Backend API**: Python 3.11+, FastAPI 0.115+, Uvicorn, Celery 5.4+, Redis 7+, PyMySQL, Pydantic v2.
- **Database Engine**: MariaDB 10.11+ / MySQL 8.0+ (`utf8mb4`).
- **AI & Integrations**: Mistral AI SDK (`mistral-small-latest`), Gmail SMTP TLS/STARTTLS Email Engine.

---

## 📂 Repository Structure

```
Kintsugi/
├── .github/                      # CI/CD Workflows & GitHub Templates
│   ├── ISSUE_TEMPLATE/           # Bug, Feature, and Question templates
│   ├── pull_request_template.md  # Standardized PR checklist
│   └── workflows/ci.yml          # GitHub Actions CI build matrix
├── architecture/                 # High-level architecture diagrams & docs
├── backend/                      # FastAPI Python REST & WebSocket Engine
│   ├── app/                      # Controllers, Services, Models, Workers
│   ├── start.py                  # Concurrent Uvicorn & Celery runner
│   └── requirements.txt          # Python dependencies
├── database/                     # MariaDB / MySQL Relational DDL
│   └── schema.sql                # Complete schema & initial seeds
├── docs/                         # Developer Onboarding & API Guides
│   ├── Architecture.md           # MVVM & Clean Architecture specs
│   ├── API.md                    # Complete REST API reference
│   ├── Authentication.md         # JWT & OTP Security flow
│   ├── Database.md               # ER diagrams & relational models
│   ├── Deployment.md             # Production Docker deployment
│   ├── Troubleshooting.md        # Common developer issues & solutions
│   └── FAQ.md                    # Frequently asked questions
├── frontend/                     # Native Android Kotlin Client
│   └── app/                      # Android Jetpack App Module
├── scripts/                      # Cross-platform setup & runner scripts
│   ├── setup.ps1 / setup.sh      # Automated environment setup
│   ├── run-all.ps1 / run-all.sh  # Multi-process runner
│   └── clean.ps1 / clean.sh      # Build artifact cleanup
├── web/                          # React + TypeScript + Vite Web Client
│   └── src/                      # Components, Hooks, Stores, Pages
├── .editorconfig                 # Standardized editor indentation
├── .gitattributes                # Line ending normalization
├── .gitignore                    # Comprehensive multi-stack ignore
├── CHANGELOG.md                  # Semantic Versioning Changelog
├── LICENSE                       # MIT License
├── README.md                     # Master GitHub README
├── RELEASE.md                    # Release & distribution guide
└── SECURITY.md                   # Vulnerability disclosure policy
```

---

## 🏛 System Architecture

Kintsugi enforces **Clean Architecture** principles across all tiers:

```
[ Android Client (MVVM + Hilt) ] ──┐
                                  ├──► [ FastAPI Backend Gateway ] ──► [ MariaDB / MySQL ]
[ Web Frontend (React + Vite) ] ──┘                │
                                                   ├──► [ Celery Task Queue + Redis ]
                                                   └──► [ Mistral AI API Engine ]
```

---

## 🚀 Step-by-Step Installation Guide

Follow these steps to set up Kintsugi locally on Windows, macOS, or Linux:

### 1. Prerequisites Verification
Ensure the following tools are installed:
- **Git**: 2.40+
- **Python**: 3.11+
- **Node.js**: 20.0+ & npm 10.0+
- **JDK**: OpenJDK 17 (or Android Studio JBR)
- **Database**: MariaDB 10.4+ or MySQL 8.0+ (e.g. XAMPP)
- **Android Studio**: Jellyfish or newer

### 2. Clone Repository
```bash
git clone https://github.com/your-username/Kintsugi.git
cd Kintsugi
```

### 3. Automated Environment Setup
- **Windows (PowerShell)**:
  ```powershell
  .\scripts\setup.ps1
  ```
- **Linux / macOS (Bash)**:
  ```bash
  chmod +x scripts/*.sh
  ./scripts/setup.sh
  ```

---

## 🏃 Running the Application Services

### 1. Start Backend & Web Servers
- **Windows (PowerShell)**:
  ```powershell
  .\scripts\run-all.ps1
  ```
- **Linux / macOS**:
  ```bash
  ./scripts/run-all.sh
  ```

### 2. Run Android Native App
1. Connect physical Android device or launch Android Emulator.
2. Setup ADB reverse port forwarding:
   ```bash
   adb reverse tcp:8000 tcp:8000
   ```
3. Build and install:
   ```bash
   cd frontend
   ./gradlew assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.kintsugi.app.debug/com.kintsugi.app.MainActivity
   ```

---

## 🔒 Environment Variables

| Variable Name | Description | Default Value |
| :--- | :--- | :--- |
| `SECRET_KEY` | 32-byte JWT signing key | `kintsugi_super_secret_jwt_key_2026` |
| `DATABASE_URL` | SQLAlchemy MySQL/MariaDB connection URI | `mysql+pymysql://root:@localhost:3306/kintsugi_db` |
| `MISTRAL_API_KEY` | Mistral AI LLM authentication key | *(Set in `.env`)* |
| `SMTP_HOST` | Transactional email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP TLS port | `587` |
| `SMTP_USER` | Sender Gmail address | `app.services.v1@gmail.com` |
| `SMTP_PASSWORD` | Gmail 16-character App Password | *(Set in `.env`)* |

---

## 📚 API Documentation

FastAPI automatically generates interactive OpenAPI Swagger & ReDoc documentation:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Technical Docs**: `http://localhost:8000/redoc`
- **OpenAPI Schema JSON**: `http://localhost:8000/api/v1/openapi.json`

Detailed API specifications are documented in [docs/API.md](file:///d:/Kintsugi/docs/API.md).

---

## 🛡 Security Specifications

- **Fernet Encrypted Journals**: Symmetrically encrypts personal reflections before DB insertion.
- **Zero Email Enumeration**: Password reset requests return generic success messages.
- **Rate Limited OTP Recovery**: Max 3 requests / 30 mins per email/IP; max 5 failed attempts before lockout.
- **5-Password History Enforcement**: Prevents password reuse across account resets.
- **Session Revocation**: Password update invalidates all active user refresh tokens across devices.

---

## 🤝 Contributing

We welcome community contributions! Please read our [Contributing Guide](file:///d:/Kintsugi/docs/Contributing.md) and adhere to our [Coding Standards](file:///d:/Kintsugi/docs/CodingStandards.md).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

## 📞 Support & Community

- **Security Alerts**: `security@kintsugi.example.com`
- **Issue Tracker**: [GitHub Issues](https://github.com/your-username/Kintsugi/issues)
- **Documentation Hub**: [docs/README.md](file:///d:/Kintsugi/docs/README.md)
