# CYNOVA — Life RPG

Cynova is a Phase 1 frontend that turns real-life actions into quests and reflects completed work through the Nova Core, XP, levels, gold, attributes, streaks, achievements, skills, rewards, and equipment.

## Run locally

```bash
npm install
npm run dev
```

On Windows systems that block `npm.ps1`, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
```

Playwright uses `npm.cmd` on Windows and `npm` elsewhere. It uses `PLAYWRIGHT_CHROME_PATH` when configured, discovers installed Chrome or Edge on Windows, and otherwise uses Playwright's standard browser resolution for Linux and CI.

## Routes

- Public: `/`, `/login`, `/register`, `/forgot-password`
- Onboarding: `/onboarding`
- Game: `/dashboard`, `/quests`, `/quests/new`, `/quests/[questId]`, `/quests/[questId]/edit`, `/character`, `/skills`, `/rewards`, `/inventory`, `/achievements`, `/history`, `/settings`
- Platform: custom not-found/error/loading UI, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/icon.svg`, `/manifest.webmanifest`

## Working interactions

- Quest create, edit, duplicate, confirmed delete, search, filters, sorting, list/board views, tags, completion history, and completion from dashboard/archive/detail
- Atomic completion updates XP, non-linear levels, gold, the matching attribute, completed-today count, streak security, achievements, and Chronicle events
- Full-snapshot optimistic completion and rollback; XP travel starts only after service success and is disabled by reduced motion
- Registration, login, demo authentication, recovery validation, and onboarding identity synchronization
- Reward purchase, insufficient-gold and already-owned handling, inventory acquisition, category-safe equip/unequip, and character equipment synchronization
- Skill upgrades consume live skill points and enforce level/prerequisite rules
- Profile name updates through the player service

## Architecture

`src/services/mock/game-service.ts` owns one in-memory typed `GameSnapshot`. Every gameplay area reads the same `game` TanStack Query key. Pure transitions in `src/lib/game-engine.ts` calculate rewards and progression. Service contracts keep API replacement isolated for Phase 2. Zustand persists only reduced motion, high contrast, graphics quality, and muted-by-default sound preferences; primary game data is never written to localStorage.

React Hook Form and Zod own quest/auth validation. Radix provides modal focus behavior. GSAP is registered once: ScrollTrigger powers the desktop progression sequence, Flip animates archive changes from a pre-change layout capture, and MotionPathPlugin handles successful XP travel. The global GSAP timeline pauses while the document is hidden.

## 3D and fallback

The landing Nova Core uses client-only React Three Fiber primitives, capped mobile DPR, reduced mobile particles, subtle desktop pointer response, sanctuary geometry, and visibility pausing. `data-render-mode="webgl"` identifies the live canvas. Reduced motion, low graphics, unavailable WebGL, or a render error produces the fully functional CSS core with `data-render-mode="fallback"`.

## Accessibility and responsive behavior

The app includes skip links, semantic landmarks, visible focus, 44px controls, text equivalents for charts, live reward feedback, labelled icon controls, accessible dialogs, focus restoration, modal sidebar body lock, Escape handling, and focus containment. Playwright checks horizontal overflow at 360×800, 390×844, 768×1024, 1024×768, 1440×900, and 1920×1080.

## Environment

Copy `.env.example` to `.env.local` when needed. `NEXT_PUBLIC_SITE_URL` controls metadata, robots, sitemap, and Open Graph URL generation; no production domain ownership is assumed.

## Mock behavior

The development repository simulates latency and can fail the next completion through **Test rollback** on the dashboard. State lasts for the current browser application session and resets when the JavaScript process reloads. This is deliberate Phase 1 behavior, not production persistence or security.

## Phase 2 boundary

Replace mock contracts with authenticated API adapters and server-authoritative persistence for users, quests, progression, inventory, achievements, streak dates, skill rules, anti-cheat validation, password recovery delivery, conflict handling, and cross-device synchronization. UI query keys, forms, domain models, accessibility behavior, and optimistic mutation boundaries can remain intact.
