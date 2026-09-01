# Kintsugi Changelog

All notable changes to the Kintsugi Mental Health & Wellness Sanctuary project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-29

### Added
- **Password Recovery System**: Production-grade 4-step forgot password recovery flow with SHA-256 hashed OTPs, 10-minute expirations, rate-limiting, 5-password history checks, session revocations, and responsive HTML email dispatch over Gmail SMTP.
- **Dark Theme Only Architecture**: Standardized Android client & Web frontend around an exclusive dark purple mindfulness theme (`AppCompatDelegate.MODE_NIGHT_YES`).
- **AI Companion Integration**: Real-time asynchronous streaming mental health companion powered by Mistral AI LLM with emotion tagging.
- **Journal & Encrypted Storage**: Rich Markdown journal editor with Fernet symmetric payload encryption, AI reflection generator, filter chips, and PDF/JSON data export bottom sheet.
- **Mood Tracker**: Dynamic 5-level interactive mood logger with streak calculation, daily analytics, and custom mood tag tags.
- **Crisis Helpline System**: Emergency SOS button with country phone picker (supports 120+ countries), direct dial integration, and crisis escalation protocols.
- **Mind Game & Wellness**: Interactive 6x6 memory matrix cognitive focus game with score multiplier, dynamic particle canvas, and breathing animation exercises.
- **Dashboard Customization**: Interactive drag-and-reorder dashboard section drawer with persistent preference state.

### Changed
- Standardized REST API endpoints across FastAPI backend, React Web app, and Android native client.
- Upgraded Android codebase to Material Design 3 dark components, ViewBinding, and Hilt Dependency Injection.

### Fixed
- Fixed notification endpoint duplicate polling and parameter parsing issues.
- Fixed Light mode resource inflation crash on Android by enforcing dark theme globally.
- Fixed Navigation Controller backstack popping bug in password reset success fragment.
