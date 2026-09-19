# ShiftBeacon

A location-aware shift management app for healthcare teams. Care workers clock
in and out from within a manager-configured workplace perimeter (geofence);
managers get visibility into who's on site, full shift history, attendance
analytics, and an AI handover digest, and can ask plain-language questions about
their own team's attendance.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Auth0](https://img.shields.io/badge/Auth0-identity-EB5424?logo=auth0&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-2E8B57)

## Why

Manual sign-in sheets and honesty-system timesheets don't hold up when hours
and location matter. ShiftBeacon confirms a care worker is physically at the
workplace before they're allowed to clock in - validated server-side, never
trusting the client - then gives managers a live view of who's on shift and
attendance analytics, with no spreadsheets involved.

## Screenshots

| Marketing landing page | Worker - active shift |
|---|---|
| ![Landing page](docs/screenshots/landing.png) | ![Worker home, clocked in](docs/screenshots/worker-home-desktop.png) |

| Manager dashboard | Workplace / geofence config |
|---|---|
| ![Manager dashboard](docs/screenshots/manager-dashboard.png) | ![Manager workplace settings](docs/screenshots/manager-workplace.png) |

<details>
<summary>Worker view on mobile</summary>

<img src="docs/screenshots/worker-home-mobile.png" alt="Worker home on mobile, clocked in" width="360" />

</details>

## Features

- **Geofenced clock-in** - workers can only clock in from inside the
  configured workplace perimeter; the browser's reported location is
  independently re-validated server-side against the organization's stored
  coordinates and radius (Haversine distance), never trusting a client-sent
  in/out flag.
- **Live staff visibility** - managers see who's currently clocked in, since
  when, and how far from the workplace, as of the latest page load.
- **Attendance analytics** - average hours/day, daily clock-in counts, and
  7-day per-staff hours, computed directly from shift records.
- **Shift history** - every clock-in/out with timestamps, coordinates, and
  optional notes, for both workers (their own history) and managers (any
  staff member's, scoped to their organization).
- **Role-based access** - Auth0-backed sign-in (username/password, Google, or
  email) with `CARE_WORKER` / `MANAGER` roles enforced server-side on every
  protected route, not just hidden in the UI.
- **AI shift handover digest** - a per-day summary of clock-in and clock-out
  notes on the manager dashboard, generated with Gemini. See
  [AI features](#ai-features).
- **Ask about attendance** - managers type or pick a question ("Who worked the
  most hours this week?") and get a plain-text answer computed from their own
  organization's shift records. Rate limited and cached. See
  [AI features](#ai-features).
- **Installable PWA** - installable app shell with an offline fallback page
  (no offline clock-in implied - geolocation and the API both require a live
  connection).
- **Error monitoring and product analytics** - Sentry and PostHog, both
  optional, with coordinates, notes, names and emails kept out of every event.
  See [Monitoring and analytics](#monitoring-and-analytics).

## Architecture

```mermaid
flowchart TB
    subgraph Client["Browser"]
        WorkerUI["Worker UI\n(clock in/out, geolocation)"]
        ManagerUI["Manager UI\n(dashboard, ask card, staff, workplace)"]
    end

    subgraph Next["Next.js App Router"]
        Pages["Server components\n(app/worker, app/manager)"]
        API["REST API routes\n(app/api/**)"]
        AuthLib["lib/auth.ts\nsession + role checks"]
        Services["lib/services/*\nshift, staff, analytics, user,\nhandover digest, ask"]
        Geo["lib/geo.ts\nHaversine distance"]
        AI["lib/ai/*\nscrubber, alias layer,\ntool-calling loop"]
        Obs["lib/observability/*\nscrubbed events"]
    end

    Auth0["Auth0\nidentity + roles"]
    DB[("PostgreSQL\nvia Prisma")]
    Gemini["Google Gemini\n(scrubbed text only)"]
    Monitoring["Sentry + PostHog\n(no coordinates or notes)"]

    WorkerUI --> Pages
    ManagerUI --> Pages
    WorkerUI -- "fetch" --> API
    ManagerUI -- "fetch" --> API

    Pages --> AuthLib
    API --> AuthLib
    AuthLib --> Auth0
    AuthLib --> Services

    API --> Services
    Services --> Geo
    Services --> DB
    Services --> AI
    AI --> Gemini
    API --> Obs
    Obs --> Monitoring
```

**Request flow for clock-in**: the browser captures a GPS reading, sends it to
`POST /api/shifts/clock-in`, the route resolves the authenticated user and
their organization via the Auth0 session, and the service layer independently
recomputes the distance to the organization's stored coordinates before
creating the shift - a client-reported "I'm inside the perimeter" is never
trusted on its own.

**Request flow for a question**: the manager card posts to
`POST /api/manager/ask`. The route checks the `MANAGER` role, then the guarded
service looks the question up in the cache, spends one of the user's hourly
allowances, and only then runs the Gemini tool-calling loop. The organization
id comes from the session at every step, never from the request or the model.

### Data model

```mermaid
erDiagram
    Organization ||--o{ User : "staff"
    Organization ||--o{ Shift : "shifts"
    User ||--o{ Shift : "clocks"
    Organization ||--o{ HandoverDigest : "daily digests"
    Organization ||--o{ AskAnswer : "cached answers"
    User ||--o{ AskUsage : "hourly counters"

    Organization {
        string id PK
        string name
        float latitude
        float longitude
        int clockInRadiusMeters
    }
    User {
        string id PK
        string auth0UserId UK
        string name
        string email
        Role role
        string organizationId FK
    }
    Shift {
        string id PK
        string userId FK
        string organizationId FK
        datetime clockInAt
        float clockInLatitude
        float clockInLongitude
        string clockInNote
        datetime clockOutAt
        float clockOutLatitude
        float clockOutLongitude
        string clockOutNote
    }
    HandoverDigest {
        string id PK
        string organizationId FK
        string date "UTC day, YYYY-MM-DD"
        string summary
        string[] keyPoints
        string[] flags
        datetime generatedAt
    }
    AskAnswer {
        string organizationId PK
        string questionHash PK
        string answer
        datetime answeredAt
    }
    AskUsage {
        string userId PK
        datetime windowStart PK
        int count
    }
```

An active shift is a `Shift` row with `clockOutAt = null`; a worker can only
have one at a time. `HandoverDigest`, `AskAnswer` and `AskUsage` are caches and
counters rather than source data: they exist so an AI answer is not regenerated
on every view and one user cannot exhaust the shared free-tier quota. They are
persisted because an in-memory version would reset on every serverless cold
start. `AskAnswer` stores a hash of the normalized question, never the question.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 + shadcn/ui, cooled-down neobrutalist design system |
| Data | PostgreSQL + Prisma ORM |
| Identity | Auth0 (username/password, Google, email), roles via a namespaced session claim |
| Validation | Zod on every API input |
| Charts | Recharts |
| AI | Google Gemini (free tier), called server-side only, with Zod-constrained output and tool calling |
| Monitoring | Sentry (`@sentry/nextjs`) for errors, PostHog for product analytics - both optional |
| Unit/API/component tests | Vitest + React Testing Library |
| End-to-end tests | Playwright |

## Getting started

**Prerequisites:** Node.js, Docker (for local Postgres), an Auth0 tenant.

```bash
git clone https://github.com/arkaslittlemind/ShiftBeacon.git
cd ShiftBeacon
npm install

cp .env.example .env.local
# fill in AUTH0_* and DATABASE_URL - see Environment variables below

docker compose up -d          # Postgres on localhost:51214
npx prisma migrate dev
npx prisma db seed            # optional: one org, a manager, care workers, shifts and notes

npm run dev                   # http://localhost:3000
```

The compose database listens on `localhost:51214` (user `postgres`, password
`postgres`, database `shiftbeacon`), so point `DATABASE_URL` there:
`postgresql://postgres:postgres@localhost:51214/shiftbeacon?schema=public`.
The placeholder in `.env.example` uses port 5432, which is not the compose port.

### Environment variables

| Variable | Used for |
|---|---|
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET` | Auth0 SDK configuration |
| `APP_BASE_URL` | Auth0 callback/logout base URL (`http://localhost:3000` locally) |
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Optional, server-side only (never `NEXT_PUBLIC_`) - the AI handover digest and the ask card. Absent means both read as unavailable and nothing else changes |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Optional - Sentry error monitoring. Only active in production builds; the auth token is build-time only, for source map upload |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST` | Optional - PostHog analytics. Only active in production; the host must match the region of your PostHog project |
| `E2E_WORKER_EMAIL`, `E2E_WORKER_PASSWORD`, `E2E_MANAGER_EMAIL`, `E2E_MANAGER_PASSWORD` | Playwright e2e suite only - real Auth0 test accounts (the manager account needs `app_metadata.role = "MANAGER"` in the Auth0 dashboard) |

The Auth0, `APP_BASE_URL` and `DATABASE_URL` variables are required and
validated at startup/build time; the app fails fast with a clear error if one is
missing. Every Gemini, Sentry and PostHog variable is optional in every
environment: leaving it out disables that integration rather than breaking the
boot.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Run Prisma migrations, then start the production server |
| `npm run lint` | ESLint |
| `npm test` | Unit/API/component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, Chromium) |
| `npm run test:evals` | Both AI eval suites (digest and attendance questions) against the real Gemini API. Needs `GEMINI_API_KEY` and spends free-tier quota; name one file to run one suite, e.g. `npm run test:evals -- evals/attendance.eval.ts` |
| `npx prisma migrate dev` | Apply schema migrations locally |
| `npx prisma db seed` | Seed demo data (idempotent) |
| `docker compose up -d` | Start local Postgres (`localhost:51214`) |

## Testing

- **Unit + API + component tests** (Vitest, around 470 tests): the Haversine
  geofence utility and its boundary cases, shift duration formatting,
  analytics calculations, Zod validation schemas, authorization on every
  protected API route, clock-in/out business rules (perimeter rejection,
  duplicate active shift), organization isolation between managers, and the
  AI layer (scrubber, alias layer, tool arguments, rate limit, answer cache,
  and the ask route and card states) with the vendor mocked.
- **End-to-end tests** (Playwright): the full worker clock-in/out journey,
  manager staff drill-down, and manager workplace configuration, against a
  real Auth0 login.
- **AI evals** (`npm run test:evals`) against the real Gemini API, separate
  from `npm test` because they spend free-tier quota:
  - **Handover digest** - 25 hand-written golden cases scored for schema
    validity and key-fact recall.
  - **Attendance questions** - 11 cases: 5 golden questions and 6 prompt
    injection attempts (an injecting question, instructions hidden inside a
    shift note, a cross-organization request) asserting that organization
    scoping holds and that only aliases, never names or ids, reach the model.

## AI features

Two manager-only features use Gemini, always from the server and never with the
key in the browser. `GEMINI_API_KEY` is optional everywhere: without it, or
when the vendor is down, both read as unavailable and nothing else about the app
changes. Neither can block or break clock-in or clock-out.

### Shift handover digest

The manager dashboard summarizes a day's clock-in and clock-out notes into a
handover digest. Digests are cached per organization per day in the database,
and the card summarizes the most recent day that actually has notes, labelled
with that date.

### Ask about attendance

A manager types a question or picks a starter question, and the answer is worked
out from their own organization's shift records. The model does not write
queries: it calls four read-only tools over the existing analytics services
(attendance summary, daily clock-ins, staff hours, and the shift notes for one
day), in a loop capped at 4 model rounds.

- **The model never chooses the tenant.** `organizationId` is closed over from
  the authenticated session; no tool takes an organization or user argument, and
  extra arguments are rejected.
- **The model never sees a name or an id.** Staff appear as "Staff 1", "Staff
  2" and so on. Names in the question are swapped for aliases before it leaves
  the app, and the server maps the aliases back in the answer the manager sees.
- **Only the last 7 days** are available, and the model is told to say so
  rather than guess about older data.
- **Rate limited and cached.** Each manager gets 10 questions per hour (a fixed
  window, counted atomically in Postgres). Identical questions from the same
  organization are answered from a 15 minute cache, which costs no vendor quota
  and does not count against the limit; the card shows when each answer was
  produced.
- **Answers render as plain text.** They are model output shaped partly by shift
  notes written by other people, so they are never treated as markdown or HTML.
- **Prompt injection is tested, not assumed.** The eval suite includes
  injections hidden inside a shift note and a cross-organization attempt.

### What is sent to Gemini

Note text is scrubbed server-side immediately before the request leaves the
app (`lib/ai/scrub-notes.ts`), in one shared place so no call site can skip it.
Coordinates, distances, emails, `auth0UserId`, and internal ids are never sent.

**The scrubber is not total, and should not be treated as if it were.** It
redacts staff names by matching the organization's own user roster, plus email
addresses and phone numbers. It therefore cannot reliably catch a *resident's*
name typed into a note by a worker, and it skips roster names shorter than
three characters, which would otherwise match ordinary prose. The free tier
also permits training and human review, so anything sent is best treated as
permanently disclosed. This is why the deployed demo runs on synthetic seeded
notes rather than real ones.

The free tier's quota is per model and small, which is why the digest and the
ask feature share one pinned model, why both are cached in the database, and why
the evals are kept out of `npm test`.

## Monitoring and analytics

Sentry (errors) and PostHog (product analytics) are optional and only active in
production. Neither receives coordinates, distances, shift notes, names or email
addresses: events are scrubbed before they are sent, users are identified by
their internal ShiftBeacon id only, PostHog autocapture and session replay are
off, and only explicitly named events are sent. A rejected clock-in is tracked
as "rejected, outside perimeter" without the distance or the location. Attendance
events are sent after the response, so an unreachable vendor cannot slow down or
break a clock-in.

## Project structure

```
app/            Next.js App Router - pages, layouts, and REST API routes
components/     Worker/manager UI components + shadcn/ui primitives
lib/            Auth, Prisma client, geofence math, validation
lib/services/   Service layer: shifts, staff, analytics, handover digest, ask
lib/ai/         Gemini client, scrubber, alias layer, attendance tools and loop
lib/observability/  Sentry and PostHog wiring and event scrubbing
prisma/         Schema, migrations, seed data
types/          Shared response and contract types
e2e/            Playwright end-to-end specs
evals/          AI eval suites (run against the real Gemini API)
brand/          Logo system and exported icon set
```

## Deployment

Targets Vercel for the app and a managed PostgreSQL instance, with Prisma
migrations running as part of the deploy (`prisma migrate deploy`, wired into
`vercel-build` and `start`) and separate Auth0 callback/logout URLs for
development and production. HTTPS is required in production - browser
geolocation needs a secure context.

Set the optional Gemini, Sentry and PostHog variables in the hosting provider as
well if you want those integrations in production. Answering one question can
take up to about 40 seconds (up to 4 sequential vendor calls), and the ask route
declares a 60 second limit, so confirm your plan's function duration ceiling
allows it.
