# Feature: Motion and polish QA

**From build-plan:** feature 21j (proposed)
**Status:** not started

## Goal

Close the redesign: apply whatever in `motion-and-polish.md` the screen specs
did not already cover, then verify contrast, reduced motion, touch behaviour,
and performance across the whole product.

## Design reference

- [../motion-and-polish.md](../motion-and-polish.md)

## In scope

- Walk every row of the review table and confirm it is done in the app; fix the
  gaps.
- Optional "Live" dot pulse on the staff table badge (reduced-motion off).
- A repo-wide check for `transition: all`, `ease-in`, `scale(0)`, animated
  `height`/`width`, and hover styles outside the `hover` variant.
- Contrast audit: every text token on every surface it appears on, both badges
  and banners, at 4.5:1 or better (3:1 for text 24px and up).
- Reduced-motion audit with the OS setting on.
- Real-phone check (Android Chrome and iOS Safari if available) of worker clock
  in and clock out: no tap highlight flash, no sticky hover, no double-tap zoom,
  no layout jump on the state change.
- Lighthouse on the production build: landing, dashboard, worker home.
- Final evidence pack: screenshots at 1440px and 390px for every screen.

## Out of scope

- New features or new screens.

## Build steps

- [ ] **Step 1 - Static checks** - the grep sweep and fixes. *Done when:* the
  sweep returns nothing.
- [ ] **Step 2 - Motion gaps** - *Done when:* every review-table row is
  observably true in the app, checked in slow motion (DevTools Animations at
  10 percent).
- [ ] **Step 3 - Contrast + reduced motion** - *Done when:* the audit table is
  recorded in the spec with every pair passing.
- [ ] **Step 4 - Device + Lighthouse** - *Done when:* the phone checks pass and
  Lighthouse accessibility is 95 or higher on all three pages.

## Files / areas

Whatever the audit finds. Expected: `app/globals.css`, `components/ui/*`, a few
screen components.

## Data / contracts

None.

## Testing

- `npm test` green; `npm run test:e2e` once at the end, when asked, since the
  redesign touches every screen the journeys cover.

## Notes for the AI

- This is the place for the `/audit` and `/check` gates before `/complete` of
  the parent feature 21.
- When everything is done, discard `prototypes/` per the prototype workflow,
  but keep `docs/redesign/` as the record.
