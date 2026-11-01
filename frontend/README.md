# FarmGuard AI — Frontend Web Application

This directory contains the mobile-first, bilingual (English & Telugu) web application for FarmGuard AI. Built with React 18, Vite, TypeScript, and Tailwind CSS.

---

## Directory Structure

```
frontend/
├── src/
│   ├── app/                 # App root component and React Router setup
│   ├── components/          # Reusable UI widgets and application shells
│   │   ├── common/          # Language toggles, ProtectedRoute
│   │   ├── layout/          # AppShell, Header, Sidebar, Mobile navigation
│   │   └── ui/              # Buttons, Cards, Inputs, Modals, Alerts, Badges
│   ├── context/             # AuthContext, FarmContext, LanguageContext
│   ├── features/            # VoiceRecorder, SpeechPlayer, SoilTrendChart
│   ├── i18n/                # English (`en.ts`) and Telugu (`te.ts`) locale dictionaries
│   ├── lib/                 # Typed API client wrapper
│   ├── pages/               # 14 complete screens (Dashboard, Disease, Soil, etc.)
│   └── styles/              # Global Tailwind CSS and fonts
├── index.html               # Vite HTML entry point
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite configuration with API proxying
├── tailwind.config.js       # Tailwind theme colors and breakpoints
├── .env.example             # Frontend environment variable template
└── README.md                # This documentation guide
```

---

## Available Commands

From within the `frontend` directory:
- `npm run dev`: Start Vite development server on `http://localhost:5173`.
- `npm run build`: Type-check with `tsc` and create production bundle in `dist/`.
- `npm run preview`: Locally preview the production build.

From the root monorepo:
- `npm run dev:frontend` or `npm run dev:web`: Start the frontend server.
- `npm run build:frontend` or `npm run build:web`: Build frontend.
