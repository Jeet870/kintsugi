# Kintsugi Contribution Guidelines

Thank you for contributing to Kintsugi! To maintain high software quality and clean repository history, please adhere to these standards.

---

## Git Workflow & Branch Strategy

- **`main`**: Production-ready code only.
- **`develop`**: Primary Integration branch.
- **Feature Branches**: `feature/<feature-name>` (e.g. `feature/journal-pdf-export`).
- **Bug Fix Branches**: `fix/<issue-description>` (e.g. `fix/password-reset-timer`).

---

## Conventional Commit Format

We enforce Conventional Commits:
- `feat: add password recovery OTP verification screen`
- `fix: resolve light mode crash in settings fragment`
- `docs: update deployment architecture guide`
- `refactor: clean up retrofit API service interfaces`

---

## Pull Request Submission Process

1. Fork the repository and create your feature branch from `develop`.
2. Ensure unit tests pass locally before submitting.
3. Open a Pull Request pointing to `develop`.
4. Fill out the Pull Request template completely.
5. Await code review and CI build status checks.
