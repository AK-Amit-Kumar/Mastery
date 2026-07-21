#  MASTERY
<img width="2366" height="1300" alt="MASTERY-collage" src="https://github.com/user-attachments/assets/309163b9-c4c3-4d44-944e-9089a81b9740" />



**10,000 hours to greatness.**

A retro, pixel art habit tracker built around the "10,000 hour rule." Pick any skill you're trying to master: reading, coding, guitar, gym, a new language. Log your practice hours, and watch a genuinely satisfying leveling system track your progress toward mastery.

🔗 **Live app:** [https://mastery-app.netlify.app/]

📦 **Repo:** https://github.com/AK-Amit-Kumar/Mastery

##

## 📖 About

Most habit/skill trackers feel like spreadsheets with a coat of paint. MASTERY is built to feel like a game instead (XP bars, tier badges, streaks, level up celebrations, and a full 8 bit CRT arcade aesthetic), so logging your practice hours is something you actually want to open every day, not another dashboard you abandon in a week.

Track as many skills as you want, log sessions as you go, and watch each one climb through 10 pixel art tiers on its way to the 10,000 hour MASTER rank.

##

## ✨ Features

**Skill tracking**
* Add unlimited skills, each with its own icon
* Log practice sessions with quick add shortcuts or custom hour entry
* Full session history per skill
* Pixel calendar heatmap of practice activity
* 10 tier XP/leveling system with animated level up modals

**Achievements & progress**
* 9 unlockable achievements (first hour logged, streaks, milestones, etc.)
* Full screen MASTER rank celebration when a skill crosses 10,000 hours
* Stats page with weekly hour breakdowns and a personal "high scores" leaderboard

**Accounts & competition**
* Email + password authentication (Supabase)
* Global leaderboard ranking all users by total hours logged across every skill
* Editable username from Settings

**Personalization**
* 5 selectable 8 bit sound themes for UI clicks (Blip, Laser, Tick, Power up, Chime)
* Distinct sound cues for logging hours, leveling up, and hitting MASTER rank
* Mute toggle
* CRT scanline overlay, Press Start 2P / VT323 pixel fonts throughout

**Data control**
* All skill/session data stored locally in the browser (instant, offline friendly)
* "Reset All Data" flow with typed confirmation to prevent accidental wipes
* Export/import all data as a single JSON file for backup or moving between devices
* Optional daily practice reminder (browser notification) if a skill hasn't been logged yet that day

**Installable & offline**
* Installable as a PWA (Add to Home Screen / desktop install) with a full app icon set
* App shell, assets, and fonts are cached via a service worker, so the app loads and works with no network connection
* Small "OFFLINE" indicator in the nav bar when there's no connection (skill tracking keeps working regardless — only login/leaderboard sync need network)

##

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS (custom retro color palette) |
| State management | Zustand (+ `persist` middleware for localStorage) |
| Animation | Framer Motion |
| Auth & shared data | Supabase (email/password auth + Postgres) |
| Routing | react-router-dom |
| Offline / installability | vite-plugin-pwa (Workbox) — service worker + web app manifest |
| Hosting | Netlify (auto deploy on push to `main`) |

##

## 🏗 Project Architecture

```
src/
├── components/       # Shared pixel art UI: buttons, bars, badges, modals, NavBar, charts
├── pages/            # Dashboard, SkillDetail, Achievements, Stats, Settings, Login, Leaderboard
├── store/            # Zustand stores
│   ├── useStore.ts       # Skills, sessions, achievements, XP/leveling logic, settings
│   └── useAuthStore.ts   # Supabase auth state (sign up / sign in / sign out)
├── utils/             # Pure logic: leveling math, streak math, date helpers, icons, sound
├── lib/
│   └── supabase.ts    # Supabase client init (reads from env vars)
├── types/             # Shared TypeScript types
└── App.tsx            # Router setup, auth gating, CRT shell

supabase/
└── schema.sql          # SQL schema + Row Level Security policies for the profiles/leaderboard table
```

### Key architectural decision: local first, cloud light

The core skill/session tracking is **100% client side**, stored in `localStorage` via Zustand's `persist` middleware. When accounts and a global leaderboard were added, the temptation was to migrate everything to a database. Instead:

* Skill/session data **stays local**. Every add, log, and delete is instant with zero network calls or loading states.
* Supabase is layered on top **only** for identity (auth) and a single synced number per user: **total hours**, which feeds the global leaderboard.

**Trade off:** detailed skill history doesn't currently sync across devices, only the total hours figure does. This was a deliberate scope choice to avoid rewriting every interaction in the app into an async, network dependent flow, while still shipping real accounts and real cross user rankings. Full data sync is a natural next step if/when it's needed (see Roadmap below).

### Routing & deployment notes
* Client side routing (`react-router-dom`) requires an SPA redirect rule on the host. See `netlify.toml`, which rewrites all paths to `index.html`.
* A catch all route in `App.tsx` sends any unmatched path back to `/`, which then redirects unauthenticated users to `/login`.

##

## 🚀 Running Locally

### Prerequisites
* Node.js 18+
* A free [Supabase](https://supabase.com) project (for auth + leaderboard; the app runs without one too, in a local only fallback mode)

### 1. Clone the repo
```bash
git clone https://github.com/AK-Amit-Kumar/Mastery.git
cd Mastery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example env file:
```bash
cp .env.example .env.local
```
Fill in your Supabase project details in `.env.local`:
```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> If you skip this step, the app still runs. It falls back to a local only mode with a warning banner on the login page, and auth/leaderboard features are disabled.

### 4. Set up the Supabase schema
In your Supabase project's SQL editor, run the contents of `supabase/schema.sql` to create the `profiles` table and Row Level Security policies.

### 5. Start the dev server
```bash
npm run dev
```
Open the printed `http://localhost:5173` URL.

### 6. Build for production
```bash
npm run build
```
Output is generated in `dist/`.

##

## 🗺 Roadmap

Planned improvements for future versions:

1. **Shareable progress cards**: export/share streaks and level ups directly to LinkedIn, X, etc.
2. **Gamified profiles**: custom avatars for users
3. **AI suggested roadmaps**: AI generated learning paths/suggestions for the skill a user is currently working on
4. **Google OAuth**: sign in with Google alongside email/password
5. **Color themes**: selectable themes beyond the default retro arcade palette
6. **Full cross device data sync**: sync complete skill/session history (not just total hours) across devices, as a natural extension of the current local first architecture

##

## 🤝 Contributing / Feedback

This is a personal project I'm actively building and iterating on. Issues, suggestions, and feedback are welcome. Feel free to open an issue on the repo.
