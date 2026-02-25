# Copilot Instructions — Sekar

Sekar is a Vietnamese ride-sharing bulletin board. Passengers (anonymous) post ride requests; drivers (registered accounts) browse them. All UI copy and error messages are in **Vietnamese**.

## Architecture

- **Framework:** Next.js 15 App Router, TypeScript 5, React 19, Tailwind CSS 3
- **Database:** Supabase (PostgreSQL) — no ORM. Raw Supabase JS client queries only. Service-role key bypasses RLS; app-layer auth is the enforced boundary.
- **Auth:** Custom JWT in `httpOnly` cookie `sekar_token` (30-day, HS256 via `jose`, passwords hashed with `bcryptjs`). No NextAuth, no Supabase Auth.
- **Push notifications:** Firebase Cloud Messaging only — not used for auth or DB.
- **3 DB tables:** `users` (drivers + admins), `posts` (nullable `user_id` for anonymous passengers), `fcm_tokens`.

## Build & Run

```bash
npm install
npm run dev        # local dev
npm run build      # production build
npm run lint       # ESLint
npm run seed       # tsx scripts/seed.ts — seed DB
```

Requires env vars: `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string), `NEXT_PUBLIC_FIREBASE_*` (client config), `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

## Code Conventions

**API routes** (`src/app/api/**/route.ts`):

- Named exports: `GET`, `POST`, `PUT`, `DELETE`.
- Auth: call `getCurrentUser()` from `@/lib/auth` directly — no API-level middleware.
- Success: `NextResponse.json({ data })`. Errors: `NextResponse.json({ error: "Vietnamese message" }, { status: 4xx|500 })`.
- Always wrap in `try/catch`; catch block returns `{ error: "Lỗi hệ thống" }` with 500.
- Check Supabase `error` inline — do not throw.

**Supabase client** (`src/lib/supabase.ts`): lazy-init singleton exported as a `Proxy`. Import and use server-side only.

**Auth helper** (`src/lib/auth.ts`): `getCurrentUser()` reads and verifies the cookie server-side. Middleware uses `verifyToken()` plus a custom `getTokenFromCookieHeader()` regex helper (Next.js `cookies()` is not available in middleware).

**Components:** Client Components use `"use client"`. No global state — local `useState` per component. User identity is fetched via `fetch("/api/auth/me")` in `useEffect` on mount. See [src/app/page.tsx](../src/app/page.tsx) and [src/components/PostForm.tsx](../src/components/PostForm.tsx) for reference patterns.

**`@/*` path alias** resolves to `./src/*`.

## Route Protection (Middleware)

`src/middleware.ts` guards only `/ho-so/:path*` (requires login) and `/admin/:path*` (requires admin role). All other routes, including all API routes, are unprotected at the middleware level.

## Key Type Definitions

See [src/types/index.ts](../src/types/index.ts):

- `UserRole` = `"driver" | "admin"` — passengers have no accounts.
- `AuthorType` = `"passenger" | "driver"`
- `PostFilter` = `"all" | "today" | "2days" | "week"`

## Vietnamese URL Slugs

| Path         | Meaning     |
| ------------ | ----------- |
| `/dang-nhap` | Login       |
| `/dang-ky`   | Register    |
| `/dang-bai`  | Create post |
| `/ho-so`     | Profile     |

## Firebase / Notifications

FCM is fire-and-forget; notification failures must not break core flows. `getMessaging()` in `src/lib/firebase-admin.ts` returns `null` when `FIREBASE_SERVICE_ACCOUNT_KEY` is absent — always null-check before use. Token cleanup after multicast is handled in `src/lib/notifications.ts`.
