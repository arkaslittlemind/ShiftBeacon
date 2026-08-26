# AGENTS.md

Instructions for AI coding agents working in this project.

## What this is

**ShiftBeacon** is a location-aware shift management application for healthcare
teams. Care workers clock in and out of shifts from within a manager-configured
workplace perimeter (geofence); managers get visibility into current staff
presence, shift history, and attendance analytics.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS, shadcn/ui (customized visual system)
- Prisma ORM + PostgreSQL
- Auth0 (username/password, Google, email)

## Coding conventions

- TypeScript strict mode, no `any`
- Functional React components, hooks only
- Server components by default; `'use client'` only when needed
- Server Actions for mutations; API routes for webhooks/external integrations
- Zod for input validation
- Auth0 establishes identity; scope every user-owned query by the
  authenticated Auth0 user id, never a client-supplied id
- Enforce role-based authorization (`CARE_WORKER` / `MANAGER`) server-side on
  every protected API route
- Prisma: use `prisma migrate dev` for schema changes, not `db push`

## Commands

- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Production server: `npm run start`
- Lint: `npm run lint`

Testing is opt-in. No test runner is configured yet.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
