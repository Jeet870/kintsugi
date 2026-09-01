# Kintsugi Web Application

The Kintsugi web client is a responsive, modern SPA built with **React 18**, **TypeScript**, **Vite**, **TailwindCSS**, **Framer Motion**, and **Shadcn UI**.

---

## Key Features & Highlights

- **Dark Mode Aesthetic**: Custom dark purple mindfulness design system with ambient glassmorphism cards and particle backdrops.
- **4-Step Password Recovery Wizard**: Interactive email verification, OTP countdown timer, live password complexity validation, and session revocation feedback.
- **Conversational AI Companion**: Real-time AI chat stream with low latency.
- **Journaling & Export**: Markdown editor with Fernet symmetric encryption, AI prompt recommendations, and export options (PDF/JSON).
- **Interactive Wellness Games**: Memory Matrix cognitive exercise with dynamic score multipliers.

---

## Directory Structure

```
web/
├── src/
│   ├── app/
│   │   └── router/
│   ├── components/
│   │   ├── ui/
│   │   └── background/
│   ├── features/
│   │   ├── auth/
│   │   ├── journal/
│   │   ├── mood-tracker/
│   │   ├── ai-companion/
│   │   └── mind-game/
│   ├── hooks/
│   ├── stores/
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Development Workflow

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:5173`.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```
