# Kintsugi Coding Standards & Style Conventions

## Python / Backend Guidelines (PEP 8)

- **Formatter**: Use `black` and `isort` for formatting.
- **Type Annotations**: Enforce strict Python type hinting on all function signatures (`def request_otp(self, db: Session, email: str) -> dict:`).
- **Docstrings**: Use Google/Sphinx style docstrings for all services, ORM models, and endpoints.
- **Error Handling**: Use explicit FastAPI `HTTPException(status_code=..., detail=...)` rather than generic exceptions.

---

## Kotlin / Android Guidelines

- **Style**: Follow official Kotlin Style Guide & Android Kotlin Guides.
- **ViewBinding**: Always clear `_binding = null` in `onDestroyView()` to prevent memory leaks.
- **Coroutines**: Explicitly inject `@IoDispatcher` CoroutineDispatcher for IO operations (`withContext(ioDispatcher)`).
- **Resource Management**: Use string resources (`@string/...`) and color tokens (`@color/...`) instead of hardcoded strings or static hex codes.

---

## TypeScript / Web Guidelines

- **Framework**: Functional React components with TypeScript types (`React.FC<Props>`).
- **State Management**: Use Zustand for global store state and React Query for server data.
- **Styling**: Use TailwindCSS classes and CSS Variables for theme design tokens.
