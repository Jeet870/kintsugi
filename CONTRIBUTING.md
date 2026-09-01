# Contributing to Kintsugi

Thank you for your interest in contributing to **Kintsugi**! We welcome contributions from developers, designers, writers, and mental health advocates of all experience levels.

---

## 📜 Code of Conduct

Kintsugi is built to create a safe, empathetic space for mental health and emotional well-being. We expect all contributors to adhere to high standards of empathy, respect, and constructive collaboration.

---

## 🛠️ Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/EswarChinthakayala-FullStack/Kintsugi
cd Kintsugi
```

### 2. Environment Setup

#### Web Frontend (React + Vite + TypeScript)
```bash
cd web
npm install
npm run dev
```

#### Native Android App (Kotlin + Jetpack Compose / MVVM)
* Open `frontend/` in Android Studio (Ladybug or newer).
* Ensure JDK 17 is configured.
* Sync Gradle project and run on an Android 8.0+ Emulator or physical device.

#### Backend Microservices (Python FastAPI + SQLAlchemy + Celery)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python start.py
```

---

## 📝 Commit Convention

We follow the **Conventional Commits** specification (`v1.0.0`). Every commit message MUST use one of the following prefixes:

* `feat`: A new feature for the user or platform.
* `fix`: A bug fix.
* `docs`: Documentation only changes.
* `style`: Code style, formatting, missing semi-colons, asset additions.
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `perf`: A code change that improves performance.
* `test`: Adding missing tests or correcting existing tests.
* `build`: Changes that affect the build system or external dependencies.
* `ci`: Changes to CI configuration files and scripts.
* `chore`: Maintenance tasks, repo initialization, configuration.
* `release`: Release preparation commits and changelog bumps.

### Example Commit Messages
```bash
git commit -m "feat(auth): implement biometric fingerprint login fallback"
git commit -m "fix(chat): resolve WebSocket connection retry backoff bug"
git commit -m "docs(api): update OpenAPI swagger documentation for journal endpoints"
```

---

## 🌿 Branching Strategy

We use a GitFlow-inspired branching strategy:

* `main`: Production-ready release branch.
* `develop`: Main development integration branch.
* `feature/<feature-name>`: Topic feature branches (e.g., `feature/dashboard`, `feature/chat`, `feature/journal`).
* `fix/<bug-name>`: Bug fix branches (e.g., `fix/chat-streaming`, `fix/navigation`).
* `release/vX.Y.Z`: Production release preparation branches.
* `hotfix/<patch-name>`: Emergency production hotfixes.

---

## 🧪 Testing Requirements

Before submitting a Pull Request, ensure all relevant test suites pass:

```bash
# Run Backend PyTest Suite
cd backend
pytest

# Run Web Selenium E2E Suite
cd selenium-tests
npm test

# Run Mobile Appium E2E Suite
cd appium-tests
npm test
```

---

## 🔀 Pull Request Process

1. Create a topic branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make clean, atomic commits adhering to Conventional Commits.
3. Push your branch to GitHub and open a Pull Request against the `develop` branch.
4. Ensure all CI workflow checks pass.
5. Code reviews are conducted by maintainers before merging.

---

## 📄 License

By contributing to Kintsugi, you agree that your contributions will be licensed under the MIT License.
