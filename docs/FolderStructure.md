# Complete Repository Directory Tree

```
Kintsugi/
├── .github/                      # GitHub Actions workflows & Issue/PR templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── ci.yml
├── architecture/                 # System architecture diagrams and specifications
│   └── README.md
├── backend/                      # FastAPI Python asynchronous API service
│   ├── app/
│   │   ├── api/v1/endpoints/    # REST API endpoints
│   │   ├── core/                # Configuration, Security, DB session
│   │   ├── db/                  # Base class & Session factory
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── repositories/        # Database data access layer
│   │   ├── schemas/             # Pydantic validation request/response schemas
│   │   ├── services/            # Core business logic services
│   │   └── workers/             # Celery background tasks & workers
│   ├── .env.example
│   ├── README.md
│   ├── requirements.txt
│   └── start.py                 # Multi-service runner script
├── database/                     # MySQL / MariaDB Relational Database
│   ├── README.md
│   └── schema.sql               # Full DDL schema creation script
├── docs/                         # Developer & Architectural Documentation
│   ├── API.md
│   ├── Architecture.md
│   ├── Authentication.md
│   ├── CodingStandards.md
│   ├── Contributing.md
│   ├── Database.md
│   ├── Deployment.md
│   ├── FAQ.md
│   ├── FolderStructure.md
│   ├── README.md
│   ├── ReleaseChecklist.md
│   ├── Testing.md
│   └── Troubleshooting.md
├── frontend/                     # Native Android Client (Kotlin + Material Design 3)
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/main/java/com/kintsugi/app/
│   │       ├── core/            # Common UI widgets, datastore, models
│   │       ├── di/              # Hilt Dependency Injection modules
│   │       └── features/        # Feature modules (Auth, Mood, Journal, etc.)
│   ├── .env.example
│   ├── README.md
│   └── build.gradle.kts
├── scripts/                      # Environment setup, runner, and cleanup automation
│   ├── clean.ps1
│   ├── clean.sh
│   ├── README.md
│   ├── run-all.ps1
│   ├── run-all.sh
│   ├── setup.ps1
│   └── setup.sh
├── web/                          # React + TypeScript + Vite Web Client
│   ├── src/
│   │   ├── app/                 # Router & Application bootstrap
│   │   ├── components/          # Shared UI & background effects
│   │   ├── features/            # Auth, Mood, Journal, Chat feature pages
│   │   ├── stores/              # Zustand global state stores
│   │   └── main.tsx
│   ├── .env.example
│   ├── README.md
│   ├── package.json
│   └── vite.config.ts
├── .editorconfig
├── .gitattributes
├── .gitignore
├── CHANGELOG.md
├── LICENSE
├── README.md
├── RELEASE.md
└── SECURITY.md
```
