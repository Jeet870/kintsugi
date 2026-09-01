# KINTSUGI — Web Implementation Plan (Rev. 2)

_Mental Health Companion App · Professional Architecture · Real-Time State Map · Complete File Registry · Combined Component Index · AI Agent Build Prompts_

> **Revision 2** — every file in the project tree now has a matching registry entry, every feature has a routed `pages/` file (Section 8), and there's a single combined page listing every feature's components (Section 7). See Section 9 for exactly what changed and why.

**Stack:** React 18 · TypeScript · Vite · TailwindCSS · shadcn/ui · Framer Motion · Recharts · Zustand · TanStack Query

---

## 1. Overview & Technology Stack

Kintsugi's web client is a feature-based React application where every screen (Mood Tracker, AI Companion, Journal, etc.) is a self-contained module owning its own API calls, hooks, and components, built on shared design-system and data-layer foundations. The defining architectural requirement is that screens update automatically as backend state changes — a mood message finishing generation, a chat reply arriving, a streak recalculating — without the user pulling to refresh.

| Layer | Choice |
| --- | --- |
| UI Framework | React 18 + TypeScript, built with Vite |
| Styling | TailwindCSS with a custom Kintsugi (gold/warm-neutral/teal) design-token theme |
| Component Library | shadcn/ui (Radix primitives) as the base vocabulary, custom animated components layered on top |
| Animation | Framer Motion — background/SVG motifs, breathing circle, chat transitions, badge unlocks |
| Charts | Recharts — mood trend and mood distribution visualizations on Profile |
| Client State | Zustand — auth session, theme, ephemeral UI state, notification badge |
| Server State & Real-Time | TanStack Query as the cache; a WebSocket layer pushes events that patch or invalidate that cache automatically |
| Forms & Validation | React Hook Form + Zod |
| Routing | React Router, with lazy-loaded feature routes |
| Testing | Vitest + React Testing Library, jsdom environment |
| Tooling | ESLint (flat config) + Prettier, sharing formatting rules across every generated file |


### 1.1 Architectural Principles

- Feature-based structure: each screen's API calls, hooks, and components live together under `features/<name>/`, not scattered across type-based folders.
- One real-time layer, reused everywhere: a single WebSocket connection and a single `useRealtimeChannel` hook pattern drives every 'automatic update' — mood messages, chat replies, streaks, achievements, notifications.
- TanStack Query owns all server data; Zustand owns only what has no server source of truth (theme, session pointer, ephemeral UI, notification count).
- Optimistic UI where it matters for perceived speed (sending a chat message, logging a mood) and real-time cache patches where it matters for correctness (the AI's reply, the AI's mood message, streak/achievement changes).
- Bespoke animated/SVG components (`AnimatedBackground`, `KintsugiCrackDivider`, `FloatingParticles`, `BreathingCircle`) are isolated in `components/animated/` so the app's gold-crack visual identity is centralized.
- No component calls an `*Api.ts` function directly — every API call goes through a `hooks/*.ts` wrapper (`useQuery`/`useMutation`).
- Shared display logic (the six mood options, date formatting) lives in one `lib/` file each, not re-implemented per component — see Section 9.
- Every feature's route target is a single `pages/<Name>Page.tsx` file that composes that feature's components — the router never imports a component directly (Section 8 indexes every page alongside the APIs it pulls in).

---

## 2. Professional Project File Structure

Feature-based layout: shared app shell/providers, a `features/` directory holding one self-contained module per screen, and a `components/` directory split between generic shadcn/ui primitives and the app's bespoke animated components. Every file listed here has a matching row in Section 4's registry — nothing is left as an unspecified placeholder.

```
kintsugi-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── app/
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── RealtimeProvider.tsx
│   │   ├── router/
│   │   │   ├── AppRouter.tsx
│   │   │   ├── routes.ts
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       └── NavigationBar.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/authApi.ts
│   │   │   ├── hooks/useLogin.ts, useRegister.ts
│   │   │   ├── components/LoginForm.tsx, RegisterForm.tsx
│   │   │   └── pages/AuthPage.tsx
│   │   ├── onboarding/
│   │   │   ├── components/WelcomeScreen.tsx, MotivationalQuoteCard.tsx, GetStartedButton.tsx
│   │   │   └── pages/WelcomePage.tsx
│   │   ├── mood-tracker/
│   │   │   ├── api/moodApi.ts
│   │   │   ├── hooks/useLogMood.ts, useMoodHistory.ts, useRealtimeMoodUpdates.ts
│   │   │   ├── components/MoodSelector.tsx, AISupportMessageCard.tsx, MoodHistoryList.tsx, MoodHistoryChart.tsx
│   │   │   └── pages/MoodTrackerPage.tsx
│   │   ├── ai-companion/
│   │   │   ├── api/chatApi.ts
│   │   │   ├── hooks/useChatSession.ts, useSendMessage.ts, useChatSocket.ts
│   │   │   ├── components/ChatWindow.tsx, ChatBubble.tsx, TypingIndicator.tsx, SuggestedPrompts.tsx, EscalationBanner.tsx
│   │   │   └── pages/AICompanionPage.tsx
│   │   ├── journal/
│   │   │   ├── api/journalApi.ts
│   │   │   ├── hooks/useJournalEntries.ts, useSaveJournalEntry.ts
│   │   │   ├── components/JournalEditor.tsx, JournalEntryCard.tsx, JournalList.tsx
│   │   │   └── pages/JournalPage.tsx
│   │   ├── breathing-exercise/
│   │   │   ├── hooks/useBreathingCycle.ts
│   │   │   ├── components/BreathingCircle.tsx, PhaseLabel.tsx, BreathingControls.tsx
│   │   │   └── pages/BreathingExercisePage.tsx
│   │   ├── daily-motivation/
│   │   │   ├── api/contentApi.ts
│   │   │   ├── hooks/useDailyContent.ts
│   │   │   ├── components/QuoteCard.tsx, AffirmationCard.tsx, SelfCareTipList.tsx
│   │   │   └── pages/DailyMotivationPage.tsx
│   │   ├── emergency-help/
│   │   │   ├── api/emergencyApi.ts
│   │   │   ├── hooks/useHelplines.ts, useCalmingTips.ts
│   │   │   ├── components/EmergencyButton.tsx, HelplineList.tsx, TalkToSomeoneCard.tsx, CalmingTipsList.tsx
│   │   │   └── pages/EmergencyHelpPage.tsx
│   │   ├── profile/
│   │   │   ├── api/profileApi.ts
│   │   │   ├── hooks/useProfile.ts, useRealtimeStreakUpdates.ts
│   │   │   ├── components/ProfileHeader.tsx, MoodStreakCard.tsx, MoodStatsChart.tsx, AchievementBadgeGrid.tsx, ThemeToggle.tsx
│   │   │   └── pages/ProfilePage.tsx
│   │   ├── settings/
│   │   │   ├── api/settingsApi.ts
│   │   │   ├── hooks/useUpdateProfile.ts
│   │   │   ├── components/ProfileEditForm.tsx, NotificationToggle.tsx, ThemeSelector.tsx, PrivacyOptions.tsx
│   │   │   └── pages/SettingsPage.tsx
│   │   ├── about/
│   │   │   ├── components/AboutContent.tsx, DisclaimerBanner.tsx
│   │   │   └── pages/AboutPage.tsx
│   │   └── mind-game/
│   │       ├── hooks/useCalmMatchGame.ts
│   │       ├── components/CalmMatchGame.tsx
│   │       └── pages/MindGamePage.tsx
│   ├── components/
│   │   ├── ui/               (shadcn primitives: button, card, dialog, input, textarea, avatar, badge, tabs, toast, sheet, progress, skeleton)
│   │   ├── animated/
│   │   │   ├── AnimatedBackground.tsx
│   │   │   ├── KintsugiCrackDivider.tsx
│   │   │   ├── FloatingParticles.tsx
│   │   │   ├── MoodEmojiAnimated.tsx
│   │   │   └── PageFadeIn.tsx
│   │   └── feedback/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── apiClient.ts
│   │   │   └── endpoints.ts
│   │   ├── query/
│   │   │   ├── queryClient.ts
│   │   │   └── queryKeys.ts
│   │   ├── realtime/
│   │   │   ├── socket.ts
│   │   │   ├── realtimeEvents.ts
│   │   │   ├── useRealtimeChannel.ts
│   │   │   └── useNotificationRealtimeSync.ts
│   │   ├── auth/
│   │   │   └── tokenStorage.ts
│   │   ├── constants/
│   │   │   └── moodOptions.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── formatDate.ts
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   ├── useThemeStore.ts
│   │   ├── useUIStore.ts
│   │   └── useNotificationStore.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── api.ts
│   ├── test/
│   │   └── setup.ts
│   └── config/
│       └── env.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── .env.example
├── package.json
├── README.md
└── index.html
```

---

## 3. Build Order

Each phase is runnable/visually verifiable on top of the last: repo tooling and the design system exist before any feature is built, and the real-time data layer exists before any feature that depends on it. Testing infrastructure is introduced early enough (Phase 0/15) to be used throughout, not bolted on at the very end.

- **Phase 0:** Project Scaffolding & Tooling
- **Phase 1:** Design System & Animated Foundation
- **Phase 2:** App Shell, Routing & Providers
- **Phase 3:** Core Data & Real-Time Layer
- **Phase 4:** Auth Feature
- **Phase 5:** Homepage / Onboarding Feature
- **Phase 6:** Mood Tracker Feature (Real-Time)
- **Phase 7:** AI Companion Feature (Real-Time Chat)
- **Phase 8:** Journal Feature
- **Phase 9:** Breathing Exercise Feature
- **Phase 10:** Daily Motivation Feature
- **Phase 11:** Emergency Help Feature
- **Phase 12:** Profile Feature (Real-Time Stats)
- **Phase 13:** Settings Feature
- **Phase 14:** About & Mind Game Features
- **Phase 15:** Testing, Polish, Accessibility & Performance

---

## 4. File Registry — Description, Connections & AI Agent Build Prompts

For each file: what it does, what it depends on / what depends on it, and a ready-to-use prompt for an AI coding agent to generate that file in isolation.

### Phase 0 — Project Scaffolding & Tooling

_Establishes the Vite + TypeScript project, styling pipeline, shadcn/ui integration, and baseline repo hygiene (lint/format/git/docs) before any feature code exists._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `package.json` | Dependency manifest: react, react-dom, typescript, vite, tailwindcss, shadcn/ui deps (radix-ui primitives, class-variance-authority, tailwind-merge), framer-motion, recharts, zustand, @tanstack/react-query, react-router-dom, axios, zod, react-hook-form, date-fns. Dev tooling: vitest, @testing-library/react, @testing-library/jest-dom, eslint + typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, prettier, eslint-config-prettier. | Consumed by npm/vite tooling only. | Generate a package.json for a Vite + React 18 + TypeScript app with TailwindCSS, shadcn/ui, Framer Motion, Recharts, Zustand, TanStack Query v5, React Router v6, Axios, Zod, React Hook Form, and date-fns as dependencies; vitest, @testing-library/react, @testing-library/jest-dom, eslint (flat config) with typescript-eslint/react-hooks/react-refresh plugins, and prettier as devDependencies. Include dev/build/lint/format/test npm scripts. |
| `vite.config.ts` | Vite build config with the React plugin, a '@' path alias to src/, and dev server proxy to the FastAPI backend for local development. | Read by the Vite dev server and build process. | Write a vite.config.ts using @vitejs/plugin-react, a '@' alias resolving to ./src, and a /api dev-server proxy target to the local FastAPI backend. |
| `tsconfig.json` | Strict TypeScript configuration with path-alias resolution matching vite.config.ts. | Used by the TS compiler and editor tooling; alias must mirror vite.config.ts. | Write a strict tsconfig.json for a Vite React TS project with baseUrl/paths configured for a '@/*' alias to './src/*'. |
| `tailwind.config.ts` | Tailwind theme extension carrying Kintsugi's design tokens: warm gold/amber accent, muted neutral background palette, calm secondary teal, custom font stack, and shadcn/ui's required CSS-variable-based color mapping. | Read by Tailwind's build step; the CSS variables it maps to are defined in src/styles/globals.css. | Write a tailwind.config.ts extending the default theme with a gold/amber primary palette, a muted warm-neutral background palette, a calm teal secondary, and shadcn/ui's standard CSS-variable color tokens (background, foreground, primary, muted, border, etc.), plus darkMode: 'class'. |
| `components.json` | shadcn/ui CLI configuration: component output path, Tailwind config path, alias mapping. | Used only by the shadcn CLI when adding new primitives. | Write a components.json for shadcn/ui pointing components at src/components/ui, utils at src/lib/utils/cn.ts, and using the '@' alias. |
| `postcss.config.js` | PostCSS pipeline running Tailwind and autoprefixer. | Used by the Vite build. | Write a standard postcss.config.js wiring tailwindcss and autoprefixer plugins. |
| `eslint.config.js` | Flat ESLint config for React + TypeScript: recommended rules plus the react-hooks and react-refresh plugins, with Prettier's conflicting style rules turned off. | Used by `npm run lint` and editor tooling; does not affect the Vite build output. | Write an eslint.config.js (flat config) for a Vite + React + TypeScript project using @eslint/js, typescript-eslint, eslint-plugin-react-hooks, and eslint-plugin-react-refresh, with eslint-config-prettier applied last to disable style rules that conflict with Prettier. |
| `.prettierrc` | Shared formatting rules (semicolons, single quotes, print width, trailing commas) so every generated file — human- or AI-agent-written — stays consistent. | Used by `npm run format` and editor format-on-save. | Write a .prettierrc with semi: true, singleQuote: true, printWidth: 100, trailingComma: 'all', and tabWidth: 2. |
| `.gitignore` | Standard Node/Vite ignore rules: node_modules, dist, .env*, coverage output, editor and OS artifacts. | Read by git only; not bundled into the app. | Write a .gitignore for a Vite + React + TypeScript project covering node_modules, dist, .env*, coverage, and common editor/OS files (.DS_Store, .vscode/*, .idea/*). |
| `README.md` | Project overview, prerequisites, setup/run/test/lint commands, the required environment variables, and a pointer to this implementation plan for architectural context. | Documentation only; not consumed by the build. | Write a README.md describing what Kintsugi is, prerequisites (Node version), npm install / npm run dev / npm run build / npm test / npm run lint instructions, the required .env variables (VITE_API_BASE_URL, VITE_WS_BASE_URL), and a short folder-structure overview. |
| `index.html` | Vite entry HTML: root div, meta tags, font preloading, favicon link, and the app's calm color-scheme meta for mobile browser chrome. | Loads src/main.tsx as the module entry point; links public/favicon.svg. | Write an index.html for a Vite React app named Kintsugi with a #root div, viewport meta tags, a <link rel='icon' href='/favicon.svg'>, and a theme-color meta matching the app's warm gold accent. |
| `public/favicon.svg` | App favicon: a minimal gold kintsugi-crack glyph on a transparent background, small enough to read at 16-32px. | Linked from index.html's <link rel='icon'>. | Create a favicon.svg: a simple abstract gold (#B8860B) crack/seam mark on a transparent background, optimized to stay legible at 16x16 and 32x32. |
| `src/vite-env.d.ts` | Vite/TypeScript ambient declarations, including an ImportMetaEnv interface for VITE_API_BASE_URL and VITE_WS_BASE_URL so import.meta.env is fully typed rather than 'any'. | Ambient — no import needed; makes config/env.ts's reads of import.meta.env type-safe. | Write a vite-env.d.ts with /// <reference types="vite/client" /> plus an ImportMetaEnv interface declaring VITE_API_BASE_URL: string and VITE_WS_BASE_URL: string, and an ImportMeta interface exposing that env shape. |
| `.env.example` | Client-side environment variables: VITE_API_BASE_URL, VITE_WS_BASE_URL. | Read via import.meta.env by src/config/env.ts. | Write a .env.example with VITE_API_BASE_URL and VITE_WS_BASE_URL placeholders for a Vite app talking to a FastAPI backend over HTTP and WebSocket. |


### Phase 1 — Design System & Animated Foundation

_Shared visual language: shadcn/ui primitives, global styles, and the bespoke animated/SVG components that give Kintsugi its distinct 'repaired with gold' identity rather than a generic wellness-app look._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `src/styles/globals.css` | Tailwind layer imports plus the CSS custom properties (light and dark) that tailwind.config.ts maps colors onto, and base typography/scroll-behavior resets. | Imported once in src/main.tsx; consumed indirectly by every Tailwind utility class in the app. | Write globals.css with @tailwind base/components/utilities, plus :root and .dark CSS variable blocks defining shadcn/ui's standard token set using a warm gold/neutral palette for light mode and a deep warm-charcoal palette for dark mode. |
| `src/lib/utils/cn.ts` | The clsx + tailwind-merge className helper required by every shadcn/ui component. | Imported by virtually every component in src/components/ui and src/components/animated. | Write the standard shadcn/ui cn() utility combining clsx and tailwind-merge. |
| `src/components/ui/*` | shadcn/ui primitives generated via CLI: button, card, dialog, input, textarea, avatar, badge, tabs, toast, sheet, progress, skeleton — the base vocabulary every feature composes. | Generated once via `npx shadcn add ...`; consumed across every feature folder. | Use the shadcn/ui CLI to add button, card, dialog, input, textarea, avatar, badge, tabs, toast, sheet, progress, and skeleton components, then verify each compiles against the Kintsugi Tailwind theme tokens. |
| `src/components/animated/AnimatedBackground.tsx` | Full-viewport ambient background: a slow-drifting radial gradient in warm gold/amber tones behind a faint SVG kintsugi-crack line pattern, rendered once and kept behind all page content via a fixed, low-z-index layer. | Mounted once in AppShell.tsx behind the route outlet; purely decorative, no data dependency. | Write a React component rendering a fixed full-screen background: an inline SVG with 3-4 organic gold crack-line paths (varying stroke width, low opacity) animated with Framer Motion (slow pathLength draw-in on mount, then a very slow ambient drift), layered over a soft radial-gradient div. Must respect prefers-reduced-motion by disabling the drift animation. |
| `src/components/animated/KintsugiCrackDivider.tsx` | Section-divider component: a horizontal gold crack SVG line that animates its stroke drawing in via Framer Motion when it scrolls into view, used between major sections (e.g. Homepage sections, Profile stat blocks). | Used by features/onboarding/components/WelcomeScreen.tsx and features/profile components. | Write a KintsugiCrackDivider component: an inline SVG jagged gold line (path with irregular angles, mimicking a kintsugi repair seam), animated with Framer Motion's useInView + pathLength from 0 to 1 over ~0.8s when scrolled into view, once only. |
| `src/components/animated/FloatingParticles.tsx` | Small ambient gold-dust particles drifting slowly upward with random horizontal sway, used sparingly (Homepage, Breathing Exercise) to reinforce the calm/warm tone without becoming distracting. | Mounted conditionally by WelcomeScreen.tsx and BreathingCircle.tsx. | Write a FloatingParticles component rendering 8-12 small circular divs with randomized initial x position, animated via Framer Motion with an infinite loop of upward translateY and gentle horizontal drift, low opacity, GPU-accelerated (transform/opacity only), disabled entirely when prefers-reduced-motion is set. |
| `src/components/animated/MoodEmojiAnimated.tsx` | Interactive emoji button used in the Mood Tracker: idle gentle float, spring scale-up on hover, and a satisfying spring 'settle' animation on selection with a brief gold glow ring. | Used by features/mood-tracker/components/MoodSelector.tsx; renders entries sourced from lib/constants/moodOptions.ts. | Write a MoodEmojiAnimated component taking an emoji, label, selected boolean, and onSelect handler; use Framer Motion whileHover scale, a spring-based selected state transition, and an animated gold box-shadow ring when selected. |
| `src/components/animated/PageFadeIn.tsx` | Route-level transition wrapper: fades and slightly slides new pages in, kept subtle to fit the calm design language. | Wraps the <Outlet /> in AppRouter.tsx. | Write a PageFadeIn wrapper component using Framer Motion's AnimatePresence + motion.div with a short opacity/translateY-8 enter transition, keyed on route pathname. |
| `src/components/feedback/LoadingSpinner.tsx` | Lightweight loading indicator styled to the gold accent, used inside buttons and suspense fallbacks. | Used across nearly every feature during data fetches. | Write a small spinning-ring LoadingSpinner component using a CSS/Tailwind animate-spin border, sized via a prop, colored with the theme's gold accent. |
| `src/components/feedback/EmptyState.tsx` | Reusable empty-state block (icon, message, optional action) used for empty journal lists, empty mood history, etc. | Used by JournalList.tsx, MoodHistoryList.tsx, AchievementBadgeGrid.tsx. | Write a generic EmptyState component accepting an icon, title, description, and optional action button, styled to the calm design system. |
| `src/components/feedback/ErrorBoundary.tsx` | Top-level React error boundary rendering a calm, non-alarming fallback screen rather than a raw stack trace, with a retry action. | Wraps <AppRouter /> in App.tsx. | Write a class-based ErrorBoundary component with getDerivedStateFromError, rendering a calm fallback UI with a 'Something went wrong, let's try again' message and a reload action. |


### Phase 2 — App Shell, Routing & Providers

_Wires every cross-cutting concern (theme, auth, data fetching, real-time connection, routing) into a single provider tree, and establishes the persistent navigation shell._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `src/main.tsx` | Application entry point: mounts <App /> into #root, imports globals.css. | Loaded by index.html; renders App.tsx. | Write the Vite/React main.tsx entry point using createRoot, wrapping <App /> in <React.StrictMode>, importing './styles/globals.css'. |
| `src/App.tsx` | Root component composing AppProviders, ErrorBoundary, and AppRouter. | Rendered by main.tsx; wraps everything else in the app. | Write App.tsx that renders <ErrorBoundary><AppProviders><AppRouter /></AppProviders></ErrorBoundary>. |
| `src/app/providers/AppProviders.tsx` | Composes QueryProvider, ThemeProvider, AuthProvider, and RealtimeProvider into a single nested tree in the correct order (auth must resolve before the realtime socket connects). | Wraps AppRouter in App.tsx; each child provider below is a distinct file. | Write an AppProviders component nesting QueryProvider > ThemeProvider > AuthProvider > RealtimeProvider > children, in that order so auth state is available before the realtime connection is established. |
| `src/app/providers/QueryProvider.tsx` | Instantiates and provides the TanStack Query client with sane defaults (staleTime, retry policy) tuned for a mobile-first app on variable connections. | Uses src/lib/query/queryClient.ts; wraps the app in AppProviders.tsx. | Write a QueryProvider component wrapping children in QueryClientProvider using the shared queryClient from lib/query/queryClient.ts. |
| `src/app/providers/ThemeProvider.tsx` | Applies the light/dark class to <html> based on useThemeStore, and persists the user's choice. | Reads/writes src/stores/useThemeStore.ts. | Write a ThemeProvider that reads the current theme from useThemeStore, toggles the 'dark' class on document.documentElement, and syncs on store change. |
| `src/app/providers/AuthProvider.tsx` | Resolves the current session on mount (checks stored token, fetches /users/me), exposes auth state via useAuthStore, and renders a splash/loading state until resolved. | Uses src/lib/auth/tokenStorage.ts, src/stores/useAuthStore.ts, features/auth/api/authApi.ts. | Write an AuthProvider that on mount reads a stored token, if present calls the /users/me endpoint, populates useAuthStore, and renders children only once the initial auth check resolves (showing a splash screen until then). |
| `src/app/providers/RealtimeProvider.tsx` | Opens the authenticated WebSocket connection once auth resolves, tears it down on logout, exposes connection status, and mounts the one app-wide notification subscription (useNotificationRealtimeSync) — this is the provider that makes 'automatic real-time updates' possible app-wide. | Uses src/lib/realtime/socket.ts, src/lib/realtime/useNotificationRealtimeSync.ts, and src/stores/useAuthStore.ts; consumed by every feature's useRealtimeChannel hook. | Write a RealtimeProvider that opens a WebSocket via lib/realtime/socket.ts once useAuthStore has a valid token, closes it on logout or unmount, exposes connection status via context, calls useNotificationRealtimeSync() once so the notification badge stays live app-wide, and reconnects with exponential backoff on drop. |
| `src/app/router/routes.ts` | Centralized route path constants (avoids magic strings scattered across the app). | Imported by AppRouter.tsx and any component that navigates. | Write a routes.ts exporting a const ROUTES object with keys for home, moodTracker, aiCompanion, journal, breathing, motivation, emergency, profile, settings, about, mindGame, and auth routes. |
| `src/app/router/ProtectedRoute.tsx` | Route guard redirecting unauthenticated users to the welcome/login screen. | Uses useAuthStore; wraps every authenticated route in AppRouter.tsx. | Write a ProtectedRoute component that reads useAuthStore, renders <Outlet /> if authenticated, otherwise <Navigate to={ROUTES.home} />. |
| `src/app/router/AppRouter.tsx` | Declares every route (public: welcome/auth; protected: all feature screens) using React Router, wrapped in PageFadeIn for transitions. | Uses ProtectedRoute.tsx, routes.ts, PageFadeIn.tsx, and lazy-imports every feature's pages/*.tsx file — it never imports a components/*.tsx file directly, so routing and presentation stay cleanly separated. | Write an AppRouter using React Router's createBrowserRouter/RouterProvider (or <Routes>), lazy-loading each feature's single pages/*.tsx entry point with React.lazy + Suspense, nesting protected routes under <ProtectedRoute />, all rendered inside AppShell. |
| `src/app/layout/AppShell.tsx` | Persistent layout: renders AnimatedBackground once, the NavigationBar, and the routed page content — the single place the background/nav are mounted so they never remount on navigation. | Renders AnimatedBackground.tsx and NavigationBar.tsx; wraps the router's outlet. | Write an AppShell component rendering <AnimatedBackground /> as a fixed layer, <NavigationBar /> above the fold, and a <main> containing the routed page content, ensuring the background persists across route changes rather than remounting. |
| `src/app/layout/NavigationBar.tsx` | Bottom (mobile) / side (desktop) navigation between the app's core sections, with an unread-notification badge sourced from useNotificationStore. | Uses routes.ts and stores/useNotificationStore.ts. | Write a responsive NavigationBar — bottom tab bar on mobile widths, left sidebar on desktop widths — linking to Home, Mood, Companion, Journal, Profile, with a small badge on a notifications icon reflecting useNotificationStore's unread count. |


### Phase 3 — Core Data & Real-Time Layer

_The API client, query-key registry, WebSocket wrapper, shared constants/utilities, and Zustand stores every feature builds on. This is the layer that makes screens update automatically without manual refresh._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `src/config/env.ts` | Typed accessor for import.meta.env values (API base URL, WS base URL) with runtime validation. | Uses the ImportMetaEnv shape from vite-env.d.ts; used by lib/api/apiClient.ts and lib/realtime/socket.ts. | Write an env.ts exporting a validated config object reading VITE_API_BASE_URL and VITE_WS_BASE_URL, throwing a clear error at startup if either is missing. |
| `src/lib/api/apiClient.ts` | Axios instance with the base URL, an auth-token request interceptor, and a response interceptor handling 401 by attempting a token refresh once before failing. | Uses config/env.ts and lib/auth/tokenStorage.ts; used by every feature's api/*.ts file. | Write an Axios instance with baseURL from env config, a request interceptor attaching the bearer token from tokenStorage, and a response interceptor that on 401 attempts one token refresh via the auth refresh endpoint before rejecting. |
| `src/lib/api/endpoints.ts` | Centralized REST endpoint path constants matching the backend's /api/v1 router. | Imported by every feature's api/*.ts file. | Write an endpoints.ts exporting path constants for auth, users, mood, journal, chat, content, emergency, and achievements endpoints, matching the FastAPI /api/v1 router structure. |
| `src/lib/query/queryClient.ts` | The single shared TanStack Query client instance with default staleTime/gcTime and retry configuration. | Used by app/providers/QueryProvider.tsx and by lib/realtime hooks that call queryClient.invalidateQueries/setQueryData directly. | Write a queryClient.ts exporting a configured QueryClient with a sensible default staleTime (e.g. 30s), retry: 1, and refetchOnWindowFocus: true. |
| `src/lib/query/queryKeys.ts` | Centralized, typed query-key factory (e.g. queryKeys.mood.history(userId)) so every feature and every real-time invalidation call references the exact same cache key. | Imported by every feature's hooks/*.ts and by lib/realtime/useRealtimeChannel.ts. | Write a queryKeys object with namespaced factory functions for auth, mood, journal, chat, profile, achievements, notifications, emergency, and content — each returning a stable array key, e.g. queryKeys.mood.history(userId) => ['mood','history',userId]. |
| `src/lib/realtime/socket.ts` | Thin WebSocket client wrapper: connect(token), disconnect(), send(event), and a subscribe(eventType, handler) pub/sub interface, with automatic exponential-backoff reconnection. | Used by app/providers/RealtimeProvider.tsx and lib/realtime/useRealtimeChannel.ts. | Write a RealtimeSocket class wrapping the native WebSocket API with connect/disconnect/send/subscribe methods, JSON-parsing incoming frames into typed events, and exponential-backoff auto-reconnect capped at a max delay. |
| `src/lib/realtime/realtimeEvents.ts` | TypeScript discriminated-union types for every server-pushed event: mood.entry_updated, chat.message_new, chat.escalation, streak.updated, achievement.earned, notification.new. | Used by socket.ts for parsing and by useRealtimeChannel.ts for dispatch. | Write TypeScript discriminated union types for realtime events (mood.entry_updated, chat.message_new, chat.escalation, streak.updated, achievement.earned, notification.new), each with a typed payload shape. |
| `src/lib/realtime/useRealtimeChannel.ts` | The hook that ties WebSocket events to TanStack Query cache updates: on each event type, either invalidates the matching query key (triggering an automatic refetch) or directly patches the cache via setQueryData for zero-latency updates (chat messages). | Uses lib/realtime/socket.ts, lib/query/queryKeys.ts, and the shared queryClient; called once per relevant feature (mood, chat, profile, notifications). | Write a useRealtimeChannel(eventType) hook that subscribes to the shared socket for a given event type and, per event, either calls queryClient.invalidateQueries(queryKeys.X(...)) or queryClient.setQueryData(...) directly — document which strategy applies to which event type. |
| `src/lib/realtime/useNotificationRealtimeSync.ts` | The concrete subscription that makes the notification badge live: listens for notification.new on the shared socket and increments useNotificationStore directly — independent of TanStack Query, since the badge count has no meaningful 'cached query' of its own. | Uses lib/realtime/useRealtimeChannel.ts and stores/useNotificationStore.ts; called once from app/providers/RealtimeProvider.tsx so it's active app-wide rather than per-screen. | Write a useNotificationRealtimeSync hook that subscribes to the 'notification.new' realtime event and calls useNotificationStore's incrementUnread on each event; it takes no props and is intended to be called exactly once, from RealtimeProvider. |
| `src/lib/auth/tokenStorage.ts` | Small wrapper around token persistence (access + refresh token) — abstracted so the storage mechanism can change without touching call sites. | Used by lib/api/apiClient.ts and app/providers/AuthProvider.tsx. | Write a tokenStorage module with getAccessToken/setAccessToken/getRefreshToken/setRefreshToken/clearTokens functions, storage mechanism abstracted behind the interface. |
| `src/lib/constants/moodOptions.ts` | Single source of truth for the six mood types: id, emoji, label, an ordered numeric value for charting, and a theme color. Replaces the risk of the same six moods being hand-typed slightly differently in three separate components. | Consumed by components/animated/MoodEmojiAnimated.tsx (via MoodSelector), features/mood-tracker/components/MoodSelector.tsx and MoodHistoryChart.tsx, and features/profile/components/MoodStatsChart.tsx. | Write a moodOptions.ts exporting a typed, ordered array of the six moods (happy, calm, sad, angry, anxious, tired), each with id, emoji, label, a numeric value for plotting, and a theme color; export a lookup-by-id helper too. |
| `src/lib/utils/formatDate.ts` | Small date-formatting helpers — a relative 'Today / Yesterday / short date' label and a standard short date format — shared by every list or card that shows a timestamp, so date formatting doesn't drift between features. | Used by features/journal/components/JournalEntryCard.tsx and features/mood-tracker/components/MoodHistoryList.tsx. | Write formatDate.ts using date-fns, exporting formatShortDate(date) (e.g. 'Jul 23, 2026') and formatRelativeDay(date) (returns 'Today', 'Yesterday', or a short date) helper functions. |
| `src/stores/useAuthStore.ts` | Zustand store holding the current user object, auth status, and login/logout actions. | Used by AuthProvider.tsx, ProtectedRoute.tsx, NavigationBar.tsx. | Write a Zustand store useAuthStore with user, isAuthenticated, setUser, and clearUser, persisted minimally (user id/name only, never tokens) via zustand/middleware persist. |
| `src/stores/useThemeStore.ts` | Zustand store for light/dark theme preference, persisted to localStorage. | Used by ThemeProvider.tsx and features/profile ThemeToggle.tsx / settings ThemeSelector.tsx. | Write a Zustand store useThemeStore with theme: 'light'\|'dark' and a toggleTheme action, persisted via zustand/middleware persist. |
| `src/stores/useUIStore.ts` | Ephemeral, non-persisted UI state: active modal/sheet, global toast queue trigger, mobile nav open state. | Used across various components needing shared ephemeral UI state. | Write a Zustand store useUIStore for ephemeral UI state such as isMobileNavOpen and activeModal, with no persistence. |
| `src/stores/useNotificationStore.ts` | Unread notification badge count, updated instantly on the notification.new real-time event. | Written to by lib/realtime/useNotificationRealtimeSync.ts; read by NavigationBar.tsx. | Write a Zustand store useNotificationStore with unreadCount, incrementUnread, and resetUnread actions. |
| `src/types/api.ts` | Shared TypeScript types mirroring backend Pydantic response shapes (User, MoodEntry, JournalEntry, ChatMessage, Achievement, HelplineResource, etc.). | Imported across every feature's api/*.ts and hooks/*.ts. | Write shared TypeScript interfaces matching the backend's Pydantic Out schemas for User, MoodEntry, JournalEntry, ChatSession, ChatMessage, Achievement, ContentItem, and HelplineResource. |


### Phase 4 — Auth Feature

_Registration and login screens gating access to the rest of the app._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/auth/api/authApi.ts` | Wraps the auth endpoints: register, login, refresh, logout. | Uses lib/api/apiClient.ts and lib/api/endpoints.ts. | Write authApi.ts with register(payload), login(payload), refresh(), and logout() functions calling the auth endpoints via apiClient. |
| `features/auth/hooks/useLogin.ts` | TanStack Query mutation wrapping authApi.login, on success storing tokens and populating useAuthStore. | Uses authApi.ts, tokenStorage.ts, useAuthStore.ts. | Write a useLogin hook using useMutation over authApi.login, persisting tokens via tokenStorage and updating useAuthStore.setUser on success. |
| `features/auth/hooks/useRegister.ts` | TanStack Query mutation wrapping authApi.register with the same post-success flow as login. | Uses authApi.ts, tokenStorage.ts, useAuthStore.ts. | Write a useRegister hook using useMutation over authApi.register, with the same token/store side effects as useLogin. |
| `features/auth/components/LoginForm.tsx` | React Hook Form + Zod validated login form (email, password). | Uses useLogin.ts; shadcn/ui input/button components. | Write a LoginForm using react-hook-form with a zod resolver validating email format and non-empty password, submitting via useLogin, with inline field errors. |
| `features/auth/components/RegisterForm.tsx` | React Hook Form + Zod validated registration form (name, email, password, confirm password). | Uses useRegister.ts; shadcn/ui components. | Write a RegisterForm using react-hook-form with a zod resolver validating name, email, password strength, and password confirmation match, submitting via useRegister. |
| `features/auth/pages/AuthPage.tsx` | The routed screen for /auth: toggles between LoginForm and RegisterForm (tab or link-based switch) and is the single file AppRouter actually lazy-imports for this feature. | Composes components/LoginForm.tsx and components/RegisterForm.tsx; routed via app/router/AppRouter.tsx at ROUTES.auth. | Write an AuthPage that renders a centered card switching between <LoginForm /> and <RegisterForm /> via a simple tab or 'Already have an account?' link toggle, with the Kintsugi wordmark above it. |


### Phase 5 — Homepage / Onboarding Feature

_The first-impression screen: welcome, tagline, motivational quote, and entry point into the app._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/onboarding/components/WelcomeScreen.tsx` | Full welcome page composing the app name/tagline, MotivationalQuoteCard, FloatingParticles, KintsugiCrackDivider, and GetStartedButton. | Composes MotivationalQuoteCard.tsx, GetStartedButton.tsx, and shared animated components. | Write a WelcomeScreen page combining the app title/tagline, a MotivationalQuoteCard, subtle FloatingParticles, and a prominent GetStartedButton, laid out calmly with generous whitespace. |
| `features/onboarding/components/MotivationalQuoteCard.tsx` | Displays a rotating quote, reusing the Daily Motivation feature's own data hook rather than calling the content API a second, separate way. | Uses features/daily-motivation/hooks/useDailyContent.ts (shared across features). | Write a MotivationalQuoteCard that reads the day's quote from useDailyContent() and renders it in a soft card with a subtle Framer Motion fade transition. |
| `features/onboarding/components/GetStartedButton.tsx` | Primary CTA routing new users to registration, returning users to login/home. | Uses ROUTES from app/router/routes.ts and useAuthStore.ts to decide destination. | Write a GetStartedButton that navigates to the register route if unauthenticated, or straight to the mood tracker home if a session already exists. |
| `features/onboarding/pages/WelcomePage.tsx` | Thin routed wrapper around WelcomeScreen.tsx — kept as its own file (rather than routing straight to the component) so every feature follows the same 'AppRouter only ever imports from pages/' convention. | Renders components/WelcomeScreen.tsx; routed via app/router/AppRouter.tsx at ROUTES.home for unauthenticated visitors. | Write a WelcomePage that simply renders <WelcomeScreen />, existing so AppRouter's lazy imports stay uniform across every feature. |


### Phase 6 — Mood Tracker Feature (Real-Time)

_Mood selection with an AI-generated supportive message that appears automatically the moment the backend finishes generating it — no manual refresh required._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/mood-tracker/api/moodApi.ts` | Wraps POST /mood and GET /mood/history. | Uses apiClient.ts, endpoints.ts. | Write moodApi.ts with logMood(payload) and getMoodHistory(params) functions. |
| `features/mood-tracker/hooks/useLogMood.ts` | Mutation that optimistically adds the new entry to the history cache immediately, then relies on the real-time layer to patch in the AI message once generated. | Uses moodApi.ts and queryKeys.mood.history; invalidated further by useRealtimeMoodUpdates.ts. | Write a useLogMood hook using useMutation with an onMutate optimistic update appending a pending entry (ai_message: null) to the mood history query cache, rolling back on error. |
| `features/mood-tracker/hooks/useMoodHistory.ts` | Query hook fetching paginated mood history. | Uses moodApi.ts and queryKeys.mood.history. | Write a useMoodHistory(userId) hook using useQuery keyed on queryKeys.mood.history(userId), calling moodApi.getMoodHistory. |
| `features/mood-tracker/hooks/useRealtimeMoodUpdates.ts` | Subscribes to the mood.entry_updated real-time event and patches the specific entry's ai_message directly into the query cache the instant Celery/Mistral finishes — this is what makes the supportive message 'just appear' without polling. | Uses lib/realtime/useRealtimeChannel.ts and queryKeys.mood.history. | Write a useRealtimeMoodUpdates hook that subscribes to the 'mood.entry_updated' realtime event and calls queryClient.setQueryData to patch the matching mood entry's ai_message field in place, without a full refetch. |
| `features/mood-tracker/components/MoodSelector.tsx` | Renders six MoodEmojiAnimated buttons sourced from the shared moodOptions list and an optional note field, calling useLogMood on submit. | Uses lib/constants/moodOptions.ts, animated/MoodEmojiAnimated.tsx, and hooks/useLogMood.ts. | Write a MoodSelector that maps lib/constants/moodOptions.ts into six MoodEmojiAnimated buttons, plus an optional note textarea, calling useLogMood on submission and showing a brief confirmation. |
| `features/mood-tracker/components/AISupportMessageCard.tsx` | Displays the AI-generated message for the most recent entry; shows a calm shimmer/skeleton state while ai_message is still null, replaced automatically once the real-time patch lands. | Reads from the same query cache useRealtimeMoodUpdates.ts patches. | Write an AISupportMessageCard that renders a skeleton shimmer while ai_message is null and smoothly fades in the real message once populated, with no manual refresh trigger required. |
| `features/mood-tracker/components/MoodHistoryList.tsx` | Scrollable list of past entries (emoji, formatted date via formatDate.ts, note snippet). | Uses hooks/useMoodHistory.ts, lib/utils/formatDate.ts, and shared EmptyState.tsx. | Write a MoodHistoryList rendering a virtualized/scrollable list of past mood entries with emoji, a date formatted via formatRelativeDay from lib/utils/formatDate.ts, and a note preview, showing EmptyState when empty. |
| `features/mood-tracker/components/MoodHistoryChart.tsx` | Recharts line/area chart visualizing mood trend over the last 30 days, mapping each entry's mood_type to the numeric scale defined in moodOptions.ts. | Uses hooks/useMoodHistory.ts, lib/constants/moodOptions.ts, and the recharts library. | Write a MoodHistoryChart using Recharts' ResponsiveContainer + AreaChart, mapping each mood entry's mood_type to its numeric value via lib/constants/moodOptions.ts, styled with the app's gold/teal palette and a smooth curve interpolation. |
| `features/mood-tracker/pages/MoodTrackerPage.tsx` | The routed /mood screen: MoodSelector above the fold, AISupportMessageCard for the latest entry, then MoodHistoryChart and MoodHistoryList below — the single file AppRouter lazy-imports for this feature. | Composes components/MoodSelector.tsx, AISupportMessageCard.tsx, MoodHistoryChart.tsx, and MoodHistoryList.tsx; routed via app/router/AppRouter.tsx at ROUTES.moodTracker. | Write a MoodTrackerPage that stacks MoodSelector, AISupportMessageCard, MoodHistoryChart, and MoodHistoryList in a scrollable column, with generous spacing between the 'log a mood' action and the historical view. |


### Phase 7 — AI Companion Feature (Real-Time Chat)

_The chat interface, streamed over the same WebSocket connection so replies (and, when triggered, crisis escalations) appear the moment the backend produces them._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/ai-companion/api/chatApi.ts` | Wraps session creation and message posting REST endpoints (used as a fallback / for history load; live turns arrive over the socket). | Uses apiClient.ts, endpoints.ts. | Write chatApi.ts with startSession(), getSession(sessionId), and postMessage(sessionId, text) functions. |
| `features/ai-companion/hooks/useChatSession.ts` | Loads/creates the active chat session and its message history. | Uses chatApi.ts and queryKeys.chat.session. | Write a useChatSession hook that fetches or creates a chat session and its message history via useQuery keyed on queryKeys.chat.session(sessionId). |
| `features/ai-companion/hooks/useSendMessage.ts` | Mutation that posts the user's message and appends it to the cache immediately (optimistic), while the AI's reply arrives separately via the real-time socket rather than the mutation's own response. | Uses chatApi.ts, queryKeys.chat.session; complements useChatSocket.ts. | Write a useSendMessage hook using useMutation that optimistically appends the user's message to the chat query cache on submit, and calls chatApi.postMessage to notify the backend, without waiting on its response to render the AI's reply. |
| `features/ai-companion/hooks/useChatSocket.ts` | Subscribes to chat.message_new and chat.escalation events for the active session and appends each incoming message directly into the cache the moment it arrives, plus drives the TypingIndicator while a reply is pending. | Uses lib/realtime/useRealtimeChannel.ts and queryKeys.chat.session. | Write a useChatSocket(sessionId) hook subscribing to 'chat.message_new' and 'chat.escalation' events scoped to the given session, appending incoming messages to the query cache via setQueryData and toggling a local isTyping state around the gap between the user's message and the AI's reply. |
| `features/ai-companion/components/ChatWindow.tsx` | Top-level chat screen: message list (auto-scrolling to newest), input box, SuggestedPrompts above the input when the conversation is empty, and an EscalationBanner rendered inline when a crisis event fires. | Composes useChatSession.ts, useSendMessage.ts, useChatSocket.ts, ChatBubble.tsx, TypingIndicator.tsx, SuggestedPrompts.tsx, EscalationBanner.tsx. | Write a ChatWindow composing the message list (mapped to ChatBubble), an auto-scroll-to-bottom effect on new messages, TypingIndicator while isTyping, SuggestedPrompts when history is empty, and conditionally an EscalationBanner when the latest event was a chat.escalation. |
| `features/ai-companion/components/ChatBubble.tsx` | Individual message bubble, styled distinctly for user vs AI vs system/escalation messages. | Rendered by ChatWindow.tsx. | Write a ChatBubble component styled differently per sender (user: right-aligned gold-tinted; ai: left-aligned neutral; system: centered muted), with a subtle Framer Motion enter animation. |
| `features/ai-companion/components/TypingIndicator.tsx` | Animated three-dot typing indicator shown while the AI's reply is pending. | Driven by useChatSocket.ts's isTyping state. | Write a TypingIndicator with three dots animated in a staggered bounce loop via Framer Motion, shown/hidden based on an isTyping prop. |
| `features/ai-companion/components/SuggestedPrompts.tsx` | Tappable starter prompts shown when a session has no messages yet. | Uses useSendMessage.ts to send the selected prompt as the first message. | Write a SuggestedPrompts component rendering 3-4 tappable prompt chips (e.g. 'I've had a hard day', 'Just want to talk'), each triggering useSendMessage on tap. |
| `features/ai-companion/components/EscalationBanner.tsx` | Calm, non-alarming inline banner shown when the crisis-detection layer flags a message: a supportive message plus quick links into Emergency Help resources, sourced from the escalation event payload. | Rendered by ChatWindow.tsx when a chat.escalation event is received; links into features/emergency-help. | Write an EscalationBanner rendering the supportive message and helpline entries from a chat.escalation event payload, styled calmly (not alarm-red), with a prominent 'Talk to Someone' link into the Emergency Help screen. |
| `features/ai-companion/pages/AICompanionPage.tsx` | Thin routed wrapper around ChatWindow.tsx plus a compact DisclaimerBanner reminding the user this is a supportive tool, not a crisis service — the single file AppRouter lazy-imports for this feature. | Renders components/ChatWindow.tsx and a compact features/about/components/DisclaimerBanner.tsx; routed via app/router/AppRouter.tsx at ROUTES.aiCompanion. | Write an AICompanionPage that renders a compact DisclaimerBanner above a full-height <ChatWindow />, so the disclaimer is visible without competing with the chat input for vertical space. |


### Phase 8 — Journal Feature

_Private daily journaling with save/view of past entries._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/journal/api/journalApi.ts` | Wraps journal CRUD endpoints. | Uses apiClient.ts, endpoints.ts. | Write journalApi.ts with list(), create(payload), update(id, payload), and remove(id) functions. |
| `features/journal/hooks/useJournalEntries.ts` | Query hook for the current user's journal entries. | Uses journalApi.ts and queryKeys.journal.list. | Write a useJournalEntries hook using useQuery keyed on queryKeys.journal.list(userId). |
| `features/journal/hooks/useSaveJournalEntry.ts` | Mutation for create/update, invalidating the journal list on success. | Uses journalApi.ts and queryKeys.journal.list. | Write a useSaveJournalEntry hook using useMutation over journalApi.create/update, invalidating queryKeys.journal.list on success. |
| `features/journal/components/JournalEditor.tsx` | Title + rich-text-ish textarea editor with autosave-on-blur and a manual Save action. | Uses useSaveJournalEntry.ts. | Write a JournalEditor with a title input and a resizable textarea, calling useSaveJournalEntry on blur (debounced) and on an explicit Save button. |
| `features/journal/components/JournalEntryCard.tsx` | Preview card for a past entry (title, date formatted via formatDate.ts, snippet) linking to the full entry. | Rendered by JournalList.tsx; uses lib/utils/formatDate.ts. | Write a JournalEntryCard showing title, a date formatted via formatShortDate from lib/utils/formatDate.ts, and a truncated content preview, opening the full entry on tap. |
| `features/journal/components/JournalList.tsx` | List of JournalEntryCard items with an EmptyState when no entries exist yet. | Uses useJournalEntries.ts, JournalEntryCard.tsx, EmptyState.tsx. | Write a JournalList rendering JournalEntryCard for each entry from useJournalEntries, with EmptyState for a first-time user. |
| `features/journal/pages/JournalPage.tsx` | The routed /journal screen: shows JournalList by default and swaps to JournalEditor (new or selected entry) via local view-state — the single file AppRouter lazy-imports for this feature. | Composes components/JournalList.tsx and components/JournalEditor.tsx; routed via app/router/AppRouter.tsx at ROUTES.journal. | Write a JournalPage holding a local 'list' \| 'editor' view-state plus the selected entry id, rendering JournalList with a 'New Entry' action that switches to JournalEditor, and a back action that returns to the list. |


### Phase 9 — Breathing Exercise Feature

_The animated inhale–hold–exhale guide, purely client-side._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/breathing-exercise/hooks/useBreathingCycle.ts` | Drives the inhale/hold/exhale timer state machine (e.g. 4s/4s/6s) independent of rendering. | Consumed by BreathingCircle.tsx and PhaseLabel.tsx. | Write a useBreathingCycle hook implementing a configurable inhale/hold/exhale timed state machine, exposing the current phase and a 0-1 progress value for that phase, using requestAnimationFrame or an interval. |
| `features/breathing-exercise/components/BreathingCircle.tsx` | The centerpiece animated SVG: a soft gold gradient circle that smoothly scales up over the inhale phase, holds, and scales down over the exhale phase, with a subtle FloatingParticles accent. | Driven by useBreathingCycle.ts; uses animated/FloatingParticles.tsx. | Write a BreathingCircle component rendering an SVG circle with a radial gold gradient fill, animated via Framer Motion's animate prop tied to useBreathingCycle's phase/progress (scale ~0.6 to 1.0 on inhale, hold, back down on exhale), with smooth easing matched to each phase's duration. |
| `features/breathing-exercise/components/PhaseLabel.tsx` | Text label ('Breathe in' / 'Hold' / 'Breathe out') cross-fading between phases. | Driven by useBreathingCycle.ts. | Write a PhaseLabel component cross-fading its text via Framer Motion's AnimatePresence whenever useBreathingCycle's phase changes. |
| `features/breathing-exercise/components/BreathingControls.tsx` | Start/pause and cycle-count controls, plus a duration preset selector. | Controls useBreathingCycle.ts's running state. | Write BreathingControls with a start/pause toggle button and a small selector for total session duration, wired to useBreathingCycle's controls. |
| `features/breathing-exercise/pages/BreathingExercisePage.tsx` | The routed /breathing screen: centers BreathingCircle and PhaseLabel with BreathingControls beneath — the single file AppRouter lazy-imports for this feature. | Composes components/BreathingCircle.tsx, PhaseLabel.tsx, and BreathingControls.tsx around one shared useBreathingCycle() instance; routed via app/router/AppRouter.tsx at ROUTES.breathing. | Write a BreathingExercisePage that calls useBreathingCycle() once and passes its state down to a centered BreathingCircle and PhaseLabel, with BreathingControls docked at the bottom. |


### Phase 10 — Daily Motivation Feature

_Quotes, affirmations, and self-care tips._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/daily-motivation/api/contentApi.ts` | Wraps the content endpoints for quotes/affirmations/tips. | Uses apiClient.ts, endpoints.ts. | Write contentApi.ts with getDailyQuote(), getAffirmations(), and getSelfCareTips() functions. |
| `features/daily-motivation/hooks/useDailyContent.ts` | Query hook fetching all three content types for the Daily Motivation screen; also reused by onboarding's MotivationalQuoteCard so both screens share one cache entry. | Uses contentApi.ts and queryKeys.content.daily; consumed by features/onboarding/components/MotivationalQuoteCard.tsx. | Write a useDailyContent hook using useQuery to fetch quote, affirmations, and tips together, keyed on queryKeys.content.daily(). |
| `features/daily-motivation/components/QuoteCard.tsx` | Styled display of the day's quote. | Rendered on the Daily Motivation page. | Write a QuoteCard styled with a large serif quotation mark accent and the gold theme. |
| `features/daily-motivation/components/AffirmationCard.tsx` | Swipeable/tappable set of positive affirmations. | Rendered on the Daily Motivation page. | Write an AffirmationCard carousel (simple index-based next/prev) cycling through affirmation strings with a fade transition. |
| `features/daily-motivation/components/SelfCareTipList.tsx` | List of short self-care tips. | Rendered on the Daily Motivation page. | Write a SelfCareTipList rendering a simple checklist-style list of tip strings with a calm icon per item. |
| `features/daily-motivation/pages/DailyMotivationPage.tsx` | The routed /motivation screen: stacks QuoteCard, AffirmationCard, and SelfCareTipList — the single file AppRouter lazy-imports for this feature. | Composes components/QuoteCard.tsx, AffirmationCard.tsx, and SelfCareTipList.tsx, all reading from one shared useDailyContent() call; routed via app/router/AppRouter.tsx at ROUTES.motivation. | Write a DailyMotivationPage that calls useDailyContent() once and passes the relevant slice down to QuoteCard, AffirmationCard, and SelfCareTipList, stacked in a calm single column. |


### Phase 11 — Emergency Help Feature

_Reachable from anywhere in the app; deliberately fast and low-friction, since this screen matters most exactly when a user is least willing to navigate a complex UI._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/emergency-help/api/emergencyApi.ts` | Wraps the helplines and calming-tips endpoints. | Uses apiClient.ts, endpoints.ts. | Write emergencyApi.ts with getHelplines(countryCode) and getCalmingTips() functions. |
| `features/emergency-help/hooks/useHelplines.ts` | Query hook for the active user's country-scoped helpline list. | Uses emergencyApi.ts and queryKeys.emergency.helplines. | Write a useHelplines hook using useQuery keyed on queryKeys.emergency.helplines(countryCode). |
| `features/emergency-help/hooks/useCalmingTips.ts` | Query hook wrapping emergencyApi.getCalmingTips — added so CalmingTipsList follows the same 'components never call *Api.ts directly' pattern used by every other feature in the app. | Uses emergencyApi.ts and queryKeys.emergency.calmingTips; consumed by CalmingTipsList.tsx. | Write a useCalmingTips hook using useQuery keyed on queryKeys.emergency.calmingTips(), calling emergencyApi.getCalmingTips(). |
| `features/emergency-help/components/EmergencyButton.tsx` | Persistent, always-reachable entry point (rendered in NavigationBar and as a floating action button on other screens) routing straight to Emergency Help — no nested menus. | Used by app/layout/NavigationBar.tsx and other feature pages. | Write an EmergencyButton — a visually distinct but calm (not alarm-red) floating or nav-integrated button that navigates directly to the Emergency Help route in a single tap from anywhere in the app. |
| `features/emergency-help/components/HelplineList.tsx` | List of helpline cards (name, number as a tap-to-call link, hours). | Uses useHelplines.ts. | Write a HelplineList rendering each helpline as a card with name, a tel: link for the phone number, and available hours. |
| `features/emergency-help/components/TalkToSomeoneCard.tsx` | Prominent card directing the user to the most relevant immediate contact option, visually the first thing on the screen. | Reads the top-priority entry from useHelplines.ts. | Write a TalkToSomeoneCard prominently featuring the single most relevant helpline with a large tap-to-call button, positioned above the general HelplineList. |
| `features/emergency-help/components/CalmingTipsList.tsx` | Quick, immediately actionable calming tips (grounding techniques) shown alongside the helpline info. | Uses hooks/useCalmingTips.ts. | Write a CalmingTipsList rendering short, immediately actionable grounding tips (e.g. 5-4-3-2-1 technique) sourced from useCalmingTips(), in a simple, fast-to-scan list. |
| `features/emergency-help/pages/EmergencyHelpPage.tsx` | The routed /emergency screen: TalkToSomeoneCard first, then HelplineList and CalmingTipsList — the single file AppRouter lazy-imports for this feature, and the actual destination of every EmergencyButton in the app. | Composes components/TalkToSomeoneCard.tsx, HelplineList.tsx, and CalmingTipsList.tsx; routed via app/router/AppRouter.tsx at ROUTES.emergency. | Write an EmergencyHelpPage that renders TalkToSomeoneCard prominently at the top, followed by HelplineList and CalmingTipsList, keeping the whole screen usable without scrolling on a typical phone where possible. |


### Phase 12 — Profile Feature (Real-Time Stats)

_Streaks, stats, and achievements — updating live as the backend's streak/achievement logic runs._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/profile/api/profileApi.ts` | Wraps profile, streak, and achievements endpoints. | Uses apiClient.ts, endpoints.ts. | Write profileApi.ts with getProfile(), getStreak(), and getAchievements() functions. |
| `features/profile/hooks/useProfile.ts` | Query hook for the user's profile data. | Uses profileApi.ts and queryKeys.profile.me. | Write a useProfile hook using useQuery keyed on queryKeys.profile.me(). |
| `features/profile/hooks/useRealtimeStreakUpdates.ts` | Subscribes to streak.updated and achievement.earned events, invalidating the relevant profile queries the instant the backend's nightly sweep or a milestone fires — no pull-to-refresh needed. | Uses lib/realtime/useRealtimeChannel.ts and queryKeys.profile.*. | Write a useRealtimeStreakUpdates hook subscribing to 'streak.updated' and 'achievement.earned' events, invalidating queryKeys.profile.streak() and queryKeys.profile.achievements() respectively, and optionally triggering a one-off badge-unlock animation event. |
| `features/profile/components/ProfileHeader.tsx` | Avatar, name, and quick summary row. | Uses useProfile.ts. | Write a ProfileHeader showing avatar, name, and a one-line summary (e.g. current streak) at the top of the Profile screen. |
| `features/profile/components/MoodStreakCard.tsx` | Current/longest streak display with a warm (not guilt-based) framing, animating the number on change. | Uses useProfile.ts / useRealtimeStreakUpdates.ts. | Write a MoodStreakCard displaying current and longest streak with a Framer Motion count-up animation whenever the value changes, framed positively rather than punitively. |
| `features/profile/components/MoodStatsChart.tsx` | Recharts bar chart summarizing mood distribution over a selectable period, derived client-side from the same mood history data the Mood Tracker already fetches (no separate stats endpoint) and mapped via the shared moodOptions scale. | Uses features/mood-tracker/hooks/useMoodHistory.ts and lib/constants/moodOptions.ts; recharts. | Write a MoodStatsChart using Recharts' ResponsiveContainer + BarChart, deriving mood-type frequency for a selectable period (7/30/90 days) client-side from useMoodHistory()'s data and lib/constants/moodOptions.ts, styled to the app palette. |
| `features/profile/components/AchievementBadgeGrid.tsx` | Grid of earned/unearned badges, with a brief unlock animation the moment a new one is earned in real time. | Uses useProfile.ts / useRealtimeStreakUpdates.ts. | Write an AchievementBadgeGrid rendering earned badges at full opacity and unearned ones greyed out, playing a short scale+glow Framer Motion animation on any badge that transitions to earned during the session. |
| `features/profile/components/ThemeToggle.tsx` | Light/dark switch. | Uses stores/useThemeStore.ts. | Write a ThemeToggle switch component bound to useThemeStore's theme and toggleTheme. |
| `features/profile/pages/ProfilePage.tsx` | The routed /profile screen: ProfileHeader, then a responsive row of MoodStreakCard and AchievementBadgeGrid, then MoodStatsChart — the single file AppRouter lazy-imports for this feature. | Composes components/ProfileHeader.tsx, MoodStreakCard.tsx, MoodStatsChart.tsx, AchievementBadgeGrid.tsx, and ThemeToggle.tsx; calls useRealtimeStreakUpdates() once; routed via app/router/AppRouter.tsx at ROUTES.profile. | Write a ProfilePage that calls useRealtimeStreakUpdates() once, then lays out ProfileHeader, a responsive row of MoodStreakCard and AchievementBadgeGrid, MoodStatsChart, and a small ThemeToggle near the bottom. |


### Phase 13 — Settings Feature

_Profile editing and app preferences._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/settings/api/settingsApi.ts` | Wraps the profile-update endpoint (PATCH /users/me). | Uses apiClient.ts, endpoints.ts. | Write settingsApi.ts with updateProfile(payload) calling PATCH /users/me. |
| `features/settings/hooks/useUpdateProfile.ts` | The shared mutation hook behind every settings control that writes to the backend — profile edits and the notification toggle both funnel through this one mutation, so success/error handling and cache invalidation live in exactly one place instead of being duplicated per form. | Uses settingsApi.ts and queryKeys.profile.me(); consumed by ProfileEditForm.tsx and NotificationToggle.tsx. | Write a useUpdateProfile hook using useMutation over settingsApi.updateProfile, invalidating queryKeys.profile.me() on success and surfacing a toast on error. |
| `features/settings/components/ProfileEditForm.tsx` | Form for editing name/avatar. | Uses hooks/useUpdateProfile.ts; react-hook-form + zod. | Write a ProfileEditForm using react-hook-form + zod for name and avatar URL, submitting via hooks/useUpdateProfile.ts. |
| `features/settings/components/NotificationToggle.tsx` | Master notification on/off switch. | Uses hooks/useUpdateProfile.ts. | Write a NotificationToggle switch persisting notification_enabled via hooks/useUpdateProfile.ts. |
| `features/settings/components/ThemeSelector.tsx` | Light/dark/system theme picker (fuller version of the Profile screen's quick toggle). | Uses stores/useThemeStore.ts. | Write a ThemeSelector offering light/dark/system options, updating useThemeStore. |
| `features/settings/components/PrivacyOptions.tsx` | UI-only privacy toggles (e.g. data export request, account deletion request) as static/demo controls per the current scope. | Standalone; not yet wired to a backend endpoint. | Write a PrivacyOptions section with UI-only controls for data export and account deletion requests, each opening a confirmation dialog (shadcn Dialog) without a live backend call yet. |
| `features/settings/pages/SettingsPage.tsx` | The routed /settings screen: ProfileEditForm, NotificationToggle, ThemeSelector, then PrivacyOptions — the single file AppRouter lazy-imports for this feature. | Composes components/ProfileEditForm.tsx, NotificationToggle.tsx, ThemeSelector.tsx, and PrivacyOptions.tsx; routed via app/router/AppRouter.tsx at ROUTES.settings. | Write a SettingsPage that stacks ProfileEditForm, NotificationToggle, ThemeSelector, and PrivacyOptions as distinct sections with clear headings and dividers. |


### Phase 14 — About & Mind Game Features

_App context, the required disclaimer, and a calm, low-stimulation mind game._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `features/about/components/AboutContent.tsx` | App description and purpose statement. | Static content page. | Write an AboutContent component describing Kintsugi's purpose and the meaning behind its name, in a warm, calm tone. |
| `features/about/components/DisclaimerBanner.tsx` | Clearly visible (not buried) statement that Kintsugi is a supportive tool, not a replacement for professional mental healthcare, with a link into Emergency Help. | Rendered prominently on the About page and, in short form, on the AI Companion screen. | Write a DisclaimerBanner component stating clearly that Kintsugi is a supportive tool and not a substitute for professional mental healthcare or crisis intervention, with a link to Emergency Help, styled to be legible and prominent rather than fine print. |
| `features/about/pages/AboutPage.tsx` | The routed /about screen: the full-size DisclaimerBanner first, then AboutContent — the single file AppRouter lazy-imports for this feature. | Composes components/DisclaimerBanner.tsx and components/AboutContent.tsx; routed via app/router/AppRouter.tsx at ROUTES.about. | Write an AboutPage rendering the full-size DisclaimerBanner above AboutContent, in that order so the disclaimer is the first thing a visitor reads. |
| `features/mind-game/hooks/useCalmMatchGame.ts` | Game-state hook for a low-stimulation memory-match game (calm imagery pairs, no timer pressure, no score penalty). | Consumed by CalmMatchGame.tsx. | Write a useCalmMatchGame hook managing a simple memory-match game state (shuffled pairs, flipped/matched tracking) with no countdown timer and no penalty for mismatches, so the mechanic stays low-pressure. |
| `features/mind-game/components/CalmMatchGame.tsx` | Renders the memory-match grid using calm nature/gold-crack imagery, with gentle flip animations and a supportive completion message rather than a score. | Uses useCalmMatchGame.ts and Framer Motion for flip transitions. | Write a CalmMatchGame component rendering a grid of flippable cards driven by useCalmMatchGame, with a smooth 3D-flip Framer Motion animation per card and a warm, non-competitive completion message when all pairs are matched. |
| `features/mind-game/pages/MindGamePage.tsx` | Thin routed wrapper around CalmMatchGame.tsx — the single file AppRouter lazy-imports for this feature. | Renders components/CalmMatchGame.tsx; routed via app/router/AppRouter.tsx at ROUTES.mindGame. | Write a MindGamePage that renders <CalmMatchGame /> inside a centered, calm-toned container with a short one-line intro above it. |


### Phase 15 — Testing, Polish, Accessibility & Performance

_Final cross-cutting pass once every feature exists, plus the testing infrastructure the app didn't yet have._

| File | Description | Connections | AI Agent Build Prompt |
| --- | --- | --- | --- |
| `vitest.config.ts` | Test runner config: jsdom test environment, the same '@' path alias as vite.config.ts, and the global setup file. | Used by `npm test`; mirrors vite.config.ts's alias so tests can import with '@/...' too. | Write a vitest.config.ts extending the Vite config, setting test.environment: 'jsdom', test.globals: true, and test.setupFiles: ['./src/test/setup.ts']. |
| `src/test/setup.ts` | Global test setup: extends Vitest's expect with jest-dom matchers and mocks window.matchMedia so components checking prefers-reduced-motion don't throw inside jsdom. | Loaded once by vitest.config.ts's setupFiles. | Write a test setup file importing '@testing-library/jest-dom', and mocking window.matchMedia so components using prefers-reduced-motion checks don't throw in jsdom. |
| `Route-level code splitting` | Every feature page lazy-loaded via React.lazy behind AppRouter's Suspense boundary, so the initial bundle only includes the shell and the first route. | Touches app/router/AppRouter.tsx. | Convert every feature page import in AppRouter.tsx to React.lazy(() => import(...)), wrapped in a single top-level Suspense with a calm LoadingSpinner fallback. |
| `Reduced-motion audit` | Pass over every Framer Motion animation (AnimatedBackground, FloatingParticles, BreathingCircle, transitions) confirming each respects prefers-reduced-motion. | Touches every file under components/animated/ and feature animation code. | Audit every Framer Motion usage in the codebase and ensure each either uses the useReducedMotion hook or a CSS prefers-reduced-motion media query to disable non-essential motion. |
| `Accessibility pass` | Keyboard navigation, focus states, ARIA labeling for icon-only buttons (EmergencyButton, MoodEmojiAnimated, ThemeToggle), and color-contrast check on the gold/dark palette. | Touches components/ui, components/animated, and feature components broadly. | Perform an accessibility pass adding aria-labels to icon-only interactive elements, verifying visible focus rings on all interactive components, and checking the gold-on-dark and gold-on-light color pairs meet WCAG AA contrast. |
| `List virtualization` | Virtualize MoodHistoryList and JournalList once entry counts grow, to keep scroll performance smooth. | Touches features/mood-tracker/components/MoodHistoryList.tsx and features/journal/components/JournalList.tsx. | Add virtualization (e.g. @tanstack/react-virtual) to MoodHistoryList and JournalList so only visible rows render once a user has a large history. |


---

## 5. Real-Time Update & State Ownership Map

This is the frontend's equivalent of a data schema: every piece of data, which layer owns it, which query key it lives under, which real-time event updates it, and how that update reaches the screen without a manual refresh.

| Domain | State Owner | Query Key | Real-Time Event | Update Behavior |
| --- | --- | --- | --- | --- |
| Mood entries | TanStack Query | mood.history(userId) | mood.entry_updated | Direct cache patch (setQueryData) of ai_message — no refetch needed. |
| Chat messages | TanStack Query | chat.session(sessionId) | chat.message_new | Direct cache append (setQueryData) — renders the instant the frame arrives. |
| Crisis escalation | Local component state | n/a (event-driven) | chat.escalation | Bypasses normal AI flow; ChatWindow renders EscalationBanner immediately from the event payload. |
| Mood streak | TanStack Query | profile.streak() | streak.updated | Query invalidation — refetches after nightly sweep or a real-time milestone. |
| Achievements | TanStack Query | profile.achievements() | achievement.earned | Query invalidation + one-off unlock animation trigger. |
| Notification badge | Zustand (useNotificationStore) | n/a | notification.new | Instant local increment via useNotificationRealtimeSync, independent of any query refetch. |
| Auth / session | Zustand (useAuthStore) | auth.me() | — (not real-time) | Resolved once at app load and on explicit login/logout. |
| Theme / UI prefs | Zustand (persisted) | n/a | n/a | Fully local, no server round-trip. |


### 5.1 Connection Lifecycle

- `RealtimeProvider` opens the WebSocket only after `AuthProvider` resolves a valid session — an unauthenticated client never holds an open socket.
- On disconnect, `socket.ts` reconnects with exponential backoff (capped) rather than a fixed retry interval, avoiding a reconnect storm if the backend restarts.
- On reconnect, affected queries (mood history, active chat session, profile) are invalidated once as a safety net, in case any event was missed while disconnected.

### 5.2 Two Update Strategies, Used Deliberately

- **Direct cache patch** (`setQueryData`) — used where the exact new value is known from the event payload and re-fetching would be wasteful: chat messages, the mood entry's `ai_message` field.
- **Invalidation** (`invalidateQueries`) — used where the event signals 'something changed, refetch the source of truth': streaks, achievements, notification list.

---

## 6. Animated & SVG Component Design Notes

Kintsugi's visual identity — repair with gold rather than generic pastel wellness-app design — is carried almost entirely by four components, kept deliberately few and reused everywhere rather than a different animation invented per screen.

### 6.1 AnimatedBackground
- A fixed, low-z-index layer mounted once in `AppShell` so it never remounts on navigation between screens.
- Two visual elements: a slow-drifting soft radial gradient, and 3-4 faint gold crack-line SVG paths that draw themselves in once on first mount.
- Deliberately subtle — this sits behind readable content on every screen, including the Journal and Chat.

### 6.2 KintsugiCrackDivider
- A section divider, not a full background element — used between distinct content blocks to visually 'repair' the seam between them, matching the app's name.
- Animates once via `useInView` + `pathLength`, not on a loop.

### 6.3 FloatingParticles
- Used sparingly — Homepage and Breathing Exercise only.
- Transform/opacity-only animation for GPU acceleration; fully disabled under `prefers-reduced-motion`.

### 6.4 BreathingCircle
- The one animation in the app whose timing is functional, not decorative — its scale animation duration must exactly match the inhale/hold/exhale durations from `useBreathingCycle`.
- Gold radial gradient fill reinforces the same visual language as the background/divider.

### 6.5 Motion & Accessibility Guardrails
- Every non-essential animation respects `prefers-reduced-motion` via Framer Motion's `useReducedMotion` hook.
- Functional motion that conveys state (typing indicator, breathing circle, streak count-up) is kept even under reduced motion, with only easing/duration simplified.

---

## 7. Complete Component Index — All Feature Components in One Place

Section 4 breaks components out phase-by-phase alongside their hooks and API files. This page instead pulls every `.tsx` component from every feature into a single combined list, grouped by feature, so the full UI surface of the app can be scanned in one place without paging through each phase.

### Design System & Animated Foundation

| Component | Path | Purpose |
| --- | --- | --- |
| * | `src/components/ui/*` | shadcn/ui primitives generated via CLI: button, card, dialog, input, textarea, avatar, badge, tabs, toast, sheet, progress, skeleton — the base vocabulary every feature composes. |
| AnimatedBackground.tsx | `src/components/animated/AnimatedBackground.tsx` | Full-viewport ambient background: a slow-drifting radial gradient in warm gold/amber tones behind a faint SVG kintsugi-crack line pattern, rendered once and kept behind all page content via a fixed, low-z-index layer. |
| KintsugiCrackDivider.tsx | `src/components/animated/KintsugiCrackDivider.tsx` | Section-divider component: a horizontal gold crack SVG line that animates its stroke drawing in via Framer Motion when it scrolls into view, used between major sections (e.g. |
| FloatingParticles.tsx | `src/components/animated/FloatingParticles.tsx` | Small ambient gold-dust particles drifting slowly upward with random horizontal sway, used sparingly (Homepage, Breathing Exercise) to reinforce the calm/warm tone without becoming distracting. |
| MoodEmojiAnimated.tsx | `src/components/animated/MoodEmojiAnimated.tsx` | Interactive emoji button used in the Mood Tracker: idle gentle float, spring scale-up on hover, and a satisfying spring 'settle' animation on selection with a brief gold glow ring. |
| PageFadeIn.tsx | `src/components/animated/PageFadeIn.tsx` | Route-level transition wrapper: fades and slightly slides new pages in, kept subtle to fit the calm design language. |
| LoadingSpinner.tsx | `src/components/feedback/LoadingSpinner.tsx` | Lightweight loading indicator styled to the gold accent, used inside buttons and suspense fallbacks. |
| EmptyState.tsx | `src/components/feedback/EmptyState.tsx` | Reusable empty-state block (icon, message, optional action) used for empty journal lists, empty mood history, etc. |
| ErrorBoundary.tsx | `src/components/feedback/ErrorBoundary.tsx` | Top-level React error boundary rendering a calm, non-alarming fallback screen rather than a raw stack trace, with a retry action. |


### App Shell, Routing & Providers

| Component | Path | Purpose |
| --- | --- | --- |
| main.tsx | `src/main.tsx` | Application entry point: mounts <App /> into #root, imports globals.css. |
| App.tsx | `src/App.tsx` | Root component composing AppProviders, ErrorBoundary, and AppRouter. |
| AppProviders.tsx | `src/app/providers/AppProviders.tsx` | Composes QueryProvider, ThemeProvider, AuthProvider, and RealtimeProvider into a single nested tree in the correct order (auth must resolve before the realtime socket connects). |
| QueryProvider.tsx | `src/app/providers/QueryProvider.tsx` | Instantiates and provides the TanStack Query client with sane defaults (staleTime, retry policy) tuned for a mobile-first app on variable connections. |
| ThemeProvider.tsx | `src/app/providers/ThemeProvider.tsx` | Applies the light/dark class to <html> based on useThemeStore, and persists the user's choice. |
| AuthProvider.tsx | `src/app/providers/AuthProvider.tsx` | Resolves the current session on mount (checks stored token, fetches /users/me), exposes auth state via useAuthStore, and renders a splash/loading state until resolved. |
| RealtimeProvider.tsx | `src/app/providers/RealtimeProvider.tsx` | Opens the authenticated WebSocket connection once auth resolves, tears it down on logout, exposes connection status, and mounts the one app-wide notification subscription (useNotificationRealtimeSync) — this is the provider that makes 'automatic real-time updates' possible app-wide. |
| ProtectedRoute.tsx | `src/app/router/ProtectedRoute.tsx` | Route guard redirecting unauthenticated users to the welcome/login screen. |
| AppRouter.tsx | `src/app/router/AppRouter.tsx` | Declares every route (public: welcome/auth; protected: all feature screens) using React Router, wrapped in PageFadeIn for transitions. |
| AppShell.tsx | `src/app/layout/AppShell.tsx` | Persistent layout: renders AnimatedBackground once, the NavigationBar, and the routed page content — the single place the background/nav are mounted so they never remount on navigation. |
| NavigationBar.tsx | `src/app/layout/NavigationBar.tsx` | Bottom (mobile) / side (desktop) navigation between the app's core sections, with an unread-notification badge sourced from useNotificationStore. |


### Auth

| Component | Path | Purpose |
| --- | --- | --- |
| LoginForm.tsx | `features/auth/components/LoginForm.tsx` | React Hook Form + Zod validated login form (email, password). |
| RegisterForm.tsx | `features/auth/components/RegisterForm.tsx` | React Hook Form + Zod validated registration form (name, email, password, confirm password). |
| AuthPage.tsx | `features/auth/pages/AuthPage.tsx` | The routed screen for /auth: toggles between LoginForm and RegisterForm (tab or link-based switch) and is the single file AppRouter actually lazy-imports for this feature. |


### Onboarding

| Component | Path | Purpose |
| --- | --- | --- |
| WelcomeScreen.tsx | `features/onboarding/components/WelcomeScreen.tsx` | Full welcome page composing the app name/tagline, MotivationalQuoteCard, FloatingParticles, KintsugiCrackDivider, and GetStartedButton. |
| MotivationalQuoteCard.tsx | `features/onboarding/components/MotivationalQuoteCard.tsx` | Displays a rotating quote, reusing the Daily Motivation feature's own data hook rather than calling the content API a second, separate way. |
| GetStartedButton.tsx | `features/onboarding/components/GetStartedButton.tsx` | Primary CTA routing new users to registration, returning users to login/home. |
| WelcomePage.tsx | `features/onboarding/pages/WelcomePage.tsx` | Thin routed wrapper around WelcomeScreen.tsx — kept as its own file (rather than routing straight to the component) so every feature follows the same 'AppRouter only ever imports from pages/' convention. |


### Mood Tracker

| Component | Path | Purpose |
| --- | --- | --- |
| MoodSelector.tsx | `features/mood-tracker/components/MoodSelector.tsx` | Renders six MoodEmojiAnimated buttons sourced from the shared moodOptions list and an optional note field, calling useLogMood on submit. |
| AISupportMessageCard.tsx | `features/mood-tracker/components/AISupportMessageCard.tsx` | Displays the AI-generated message for the most recent entry; shows a calm shimmer/skeleton state while ai_message is still null, replaced automatically once the real-time patch lands. |
| MoodHistoryList.tsx | `features/mood-tracker/components/MoodHistoryList.tsx` | Scrollable list of past entries (emoji, formatted date via formatDate.ts, note snippet). |
| MoodHistoryChart.tsx | `features/mood-tracker/components/MoodHistoryChart.tsx` | Recharts line/area chart visualizing mood trend over the last 30 days, mapping each entry's mood_type to the numeric scale defined in moodOptions.ts. |
| MoodTrackerPage.tsx | `features/mood-tracker/pages/MoodTrackerPage.tsx` | The routed /mood screen: MoodSelector above the fold, AISupportMessageCard for the latest entry, then MoodHistoryChart and MoodHistoryList below — the single file AppRouter lazy-imports for this feature. |


### Ai Companion

| Component | Path | Purpose |
| --- | --- | --- |
| ChatWindow.tsx | `features/ai-companion/components/ChatWindow.tsx` | Top-level chat screen: message list (auto-scrolling to newest), input box, SuggestedPrompts above the input when the conversation is empty, and an EscalationBanner rendered inline when a crisis event fires. |
| ChatBubble.tsx | `features/ai-companion/components/ChatBubble.tsx` | Individual message bubble, styled distinctly for user vs AI vs system/escalation messages. |
| TypingIndicator.tsx | `features/ai-companion/components/TypingIndicator.tsx` | Animated three-dot typing indicator shown while the AI's reply is pending. |
| SuggestedPrompts.tsx | `features/ai-companion/components/SuggestedPrompts.tsx` | Tappable starter prompts shown when a session has no messages yet. |
| EscalationBanner.tsx | `features/ai-companion/components/EscalationBanner.tsx` | Calm, non-alarming inline banner shown when the crisis-detection layer flags a message: a supportive message plus quick links into Emergency Help resources, sourced from the escalation event payload. |
| AICompanionPage.tsx | `features/ai-companion/pages/AICompanionPage.tsx` | Thin routed wrapper around ChatWindow.tsx plus a compact DisclaimerBanner reminding the user this is a supportive tool, not a crisis service — the single file AppRouter lazy-imports for this feature. |


### Journal

| Component | Path | Purpose |
| --- | --- | --- |
| JournalEditor.tsx | `features/journal/components/JournalEditor.tsx` | Title + rich-text-ish textarea editor with autosave-on-blur and a manual Save action. |
| JournalEntryCard.tsx | `features/journal/components/JournalEntryCard.tsx` | Preview card for a past entry (title, date formatted via formatDate.ts, snippet) linking to the full entry. |
| JournalList.tsx | `features/journal/components/JournalList.tsx` | List of JournalEntryCard items with an EmptyState when no entries exist yet. |
| JournalPage.tsx | `features/journal/pages/JournalPage.tsx` | The routed /journal screen: shows JournalList by default and swaps to JournalEditor (new or selected entry) via local view-state — the single file AppRouter lazy-imports for this feature. |


### Breathing Exercise

| Component | Path | Purpose |
| --- | --- | --- |
| BreathingCircle.tsx | `features/breathing-exercise/components/BreathingCircle.tsx` | The centerpiece animated SVG: a soft gold gradient circle that smoothly scales up over the inhale phase, holds, and scales down over the exhale phase, with a subtle FloatingParticles accent. |
| PhaseLabel.tsx | `features/breathing-exercise/components/PhaseLabel.tsx` | Text label ('Breathe in' / 'Hold' / 'Breathe out') cross-fading between phases. |
| BreathingControls.tsx | `features/breathing-exercise/components/BreathingControls.tsx` | Start/pause and cycle-count controls, plus a duration preset selector. |
| BreathingExercisePage.tsx | `features/breathing-exercise/pages/BreathingExercisePage.tsx` | The routed /breathing screen: centers BreathingCircle and PhaseLabel with BreathingControls beneath — the single file AppRouter lazy-imports for this feature. |


### Daily Motivation

| Component | Path | Purpose |
| --- | --- | --- |
| QuoteCard.tsx | `features/daily-motivation/components/QuoteCard.tsx` | Styled display of the day's quote. |
| AffirmationCard.tsx | `features/daily-motivation/components/AffirmationCard.tsx` | Swipeable/tappable set of positive affirmations. |
| SelfCareTipList.tsx | `features/daily-motivation/components/SelfCareTipList.tsx` | List of short self-care tips. |
| DailyMotivationPage.tsx | `features/daily-motivation/pages/DailyMotivationPage.tsx` | The routed /motivation screen: stacks QuoteCard, AffirmationCard, and SelfCareTipList — the single file AppRouter lazy-imports for this feature. |


### Emergency Help

| Component | Path | Purpose |
| --- | --- | --- |
| EmergencyButton.tsx | `features/emergency-help/components/EmergencyButton.tsx` | Persistent, always-reachable entry point (rendered in NavigationBar and as a floating action button on other screens) routing straight to Emergency Help — no nested menus. |
| HelplineList.tsx | `features/emergency-help/components/HelplineList.tsx` | List of helpline cards (name, number as a tap-to-call link, hours). |
| TalkToSomeoneCard.tsx | `features/emergency-help/components/TalkToSomeoneCard.tsx` | Prominent card directing the user to the most relevant immediate contact option, visually the first thing on the screen. |
| CalmingTipsList.tsx | `features/emergency-help/components/CalmingTipsList.tsx` | Quick, immediately actionable calming tips (grounding techniques) shown alongside the helpline info. |
| EmergencyHelpPage.tsx | `features/emergency-help/pages/EmergencyHelpPage.tsx` | The routed /emergency screen: TalkToSomeoneCard first, then HelplineList and CalmingTipsList — the single file AppRouter lazy-imports for this feature, and the actual destination of every EmergencyButton in the app. |


### Profile

| Component | Path | Purpose |
| --- | --- | --- |
| ProfileHeader.tsx | `features/profile/components/ProfileHeader.tsx` | Avatar, name, and quick summary row. |
| MoodStreakCard.tsx | `features/profile/components/MoodStreakCard.tsx` | Current/longest streak display with a warm (not guilt-based) framing, animating the number on change. |
| MoodStatsChart.tsx | `features/profile/components/MoodStatsChart.tsx` | Recharts bar chart summarizing mood distribution over a selectable period, derived client-side from the same mood history data the Mood Tracker already fetches (no separate stats endpoint) and mapped via the shared moodOptions scale. |
| AchievementBadgeGrid.tsx | `features/profile/components/AchievementBadgeGrid.tsx` | Grid of earned/unearned badges, with a brief unlock animation the moment a new one is earned in real time. |
| ThemeToggle.tsx | `features/profile/components/ThemeToggle.tsx` | Light/dark switch. |
| ProfilePage.tsx | `features/profile/pages/ProfilePage.tsx` | The routed /profile screen: ProfileHeader, then a responsive row of MoodStreakCard and AchievementBadgeGrid, then MoodStatsChart — the single file AppRouter lazy-imports for this feature. |


### Settings

| Component | Path | Purpose |
| --- | --- | --- |
| ProfileEditForm.tsx | `features/settings/components/ProfileEditForm.tsx` | Form for editing name/avatar. |
| NotificationToggle.tsx | `features/settings/components/NotificationToggle.tsx` | Master notification on/off switch. |
| ThemeSelector.tsx | `features/settings/components/ThemeSelector.tsx` | Light/dark/system theme picker (fuller version of the Profile screen's quick toggle). |
| PrivacyOptions.tsx | `features/settings/components/PrivacyOptions.tsx` | UI-only privacy toggles (e.g. |
| SettingsPage.tsx | `features/settings/pages/SettingsPage.tsx` | The routed /settings screen: ProfileEditForm, NotificationToggle, ThemeSelector, then PrivacyOptions — the single file AppRouter lazy-imports for this feature. |


### About

| Component | Path | Purpose |
| --- | --- | --- |
| AboutContent.tsx | `features/about/components/AboutContent.tsx` | App description and purpose statement. |
| DisclaimerBanner.tsx | `features/about/components/DisclaimerBanner.tsx` | Clearly visible (not buried) statement that Kintsugi is a supportive tool, not a replacement for professional mental healthcare, with a link into Emergency Help. |
| AboutPage.tsx | `features/about/pages/AboutPage.tsx` | The routed /about screen: the full-size DisclaimerBanner first, then AboutContent — the single file AppRouter lazy-imports for this feature. |


### Mind Game

| Component | Path | Purpose |
| --- | --- | --- |
| CalmMatchGame.tsx | `features/mind-game/components/CalmMatchGame.tsx` | Renders the memory-match grid using calm nature/gold-crack imagery, with gentle flip animations and a supportive completion message rather than a score. |
| MindGamePage.tsx | `features/mind-game/pages/MindGamePage.tsx` | Thin routed wrapper around CalmMatchGame.tsx — the single file AppRouter lazy-imports for this feature. |


_71 components across 14 feature areas — every one of them also has a full row (description, connections, AI build prompt) in Section 4._

---

## 8. Pages & Routes Index — Every Screen, Its Components & Its APIs

Section 7 combines every feature's components into one place; this page goes one level up and combines every feature's routed page with the route it lives at, the components that page composes, and the API layer behind it — the single page an AI build agent or new developer needs to understand how features, screens, and backend calls all tie together.

| Page | Route | Feature | Composes | APIs / Hooks Used |
| --- | --- | --- | --- | --- |
| `AuthPage.tsx` | `ROUTES.auth` | auth | LoginForm, RegisterForm | authApi.ts — via useLogin, useRegister |
| `WelcomePage.tsx` | `ROUTES.home` | onboarding | WelcomeScreen (→ MotivationalQuoteCard, GetStartedButton) | contentApi.ts — via daily-motivation's useDailyContent |
| `MoodTrackerPage.tsx` | `ROUTES.moodTracker` | mood-tracker | MoodSelector, AISupportMessageCard, MoodHistoryChart, MoodHistoryList | moodApi.ts — via useLogMood, useMoodHistory, useRealtimeMoodUpdates |
| `AICompanionPage.tsx` | `ROUTES.aiCompanion` | ai-companion | ChatWindow (→ ChatBubble, TypingIndicator, SuggestedPrompts, EscalationBanner), DisclaimerBanner | chatApi.ts — via useChatSession, useSendMessage, useChatSocket |
| `JournalPage.tsx` | `ROUTES.journal` | journal | JournalList (→ JournalEntryCard), JournalEditor | journalApi.ts — via useJournalEntries, useSaveJournalEntry |
| `BreathingExercisePage.tsx` | `ROUTES.breathing` | breathing-exercise | BreathingCircle, PhaseLabel, BreathingControls | none — purely client-side (useBreathingCycle) |
| `DailyMotivationPage.tsx` | `ROUTES.motivation` | daily-motivation | QuoteCard, AffirmationCard, SelfCareTipList | contentApi.ts — via useDailyContent |
| `EmergencyHelpPage.tsx` | `ROUTES.emergency` | emergency-help | TalkToSomeoneCard, HelplineList, CalmingTipsList | emergencyApi.ts — via useHelplines, useCalmingTips |
| `ProfilePage.tsx` | `ROUTES.profile` | profile | ProfileHeader, MoodStreakCard, MoodStatsChart, AchievementBadgeGrid, ThemeToggle | profileApi.ts — via useProfile, useRealtimeStreakUpdates (+ mood-tracker's useMoodHistory for stats) |
| `SettingsPage.tsx` | `ROUTES.settings` | settings | ProfileEditForm, NotificationToggle, ThemeSelector, PrivacyOptions | settingsApi.ts — via useUpdateProfile |
| `AboutPage.tsx` | `ROUTES.about` | about | DisclaimerBanner, AboutContent | none — static content |
| `MindGamePage.tsx` | `ROUTES.mindGame` | mind-game | CalmMatchGame | none — purely client-side (useCalmMatchGame) |


_Every page in this table lives at `features/<feature>/pages/<Page>.tsx` and is the only file `app/router/AppRouter.tsx` ever lazy-imports for that feature — components and hooks are assembled inside the page, never wired up again at the router level._

---

## 9. Revision Notes — Files Added or Clarified in This Update

The previous version's file tree collapsed each feature folder to an '(api, hooks, components)' annotation instead of listing real filenames, which hid a few genuine gaps: files implied by a component's description but never given their own registry row. It also had no single page combining every feature's components (Section 7) or every page with its route and APIs (Section 8) — both are new in this revision. Every other gap below is filled in Sections 2 and 4.

| File(s) | Phase | Why it was added |
| --- | --- | --- |
| public/favicon.svg | Phase 0 | Listed in the file tree but had no registry row and index.html had no <link rel='icon'> to load it. |
| .gitignore, README.md, eslint.config.js, .prettierrc, src/vite-env.d.ts | Phase 0 | Baseline repo hygiene an AI agent (or new dev) needs on day one — none of these existed anywhere in the plan. |
| src/lib/realtime/useNotificationRealtimeSync.ts | Phase 3 | useNotificationStore's docs said it was 'written to by the realtime layer's notification handler', but no file actually implemented that subscription. |
| src/lib/constants/moodOptions.ts | Phase 3 | The six mood types (emoji/label/scale/color) were implied by three different components (MoodSelector, MoodHistoryChart, MoodStatsChart) with no single source of truth — high risk of drift. |
| src/lib/utils/formatDate.ts | Phase 3 | 'Formatted date' was referenced by both JournalEntryCard and MoodHistoryList with no shared implementation specified. |
| features/emergency-help/hooks/useCalmingTips.ts | Phase 11 | CalmingTipsList was the one component in the entire app calling an *Api.ts function directly instead of going through a hook — now consistent with the rest of the codebase. |
| features/profile/components/MoodStatsChart.tsx (clarified, not new) | Phase 12 | Original spec said 'uses useProfile.ts or a dedicated stats query' — ambiguous. Resolved to derive stats client-side from the mood-tracker's existing useMoodHistory.ts, avoiding a redundant backend endpoint. |
| features/settings/hooks/useUpdateProfile.ts | Phase 13 | Both ProfileEditForm and NotificationToggle referenced 'a mutation hook' over settingsApi without one being defined — now a single shared hook. |
| vitest.config.ts, src/test/setup.ts | Phase 15 | The plan specified no testing infrastructure at all despite package.json needing test dependencies. |
| File tree (Section 2) | — | Previously collapsed feature folders to '(api, hooks, components)' annotations; now expands every feature to its exact file list, matching the Section 4 registry file-for-file. |
| features/*/pages/*.tsx — 12 files, one per feature, plus routes.ts's missing mindGame key | Phases 4–14 | AppRouter.tsx's own spec said it 'lazy-imports every feature's top-level page component', but no feature actually had a pages/ folder or a Page file — only sub-components existed, with nothing to route to. Section 8 (new) indexes all 12 alongside the APIs each one pulls in. |


_Nothing in this revision changes the real-time architecture, the backend contract, or any existing file's responsibility — it only fills gaps, removes ambiguity, and adds the combined component view._