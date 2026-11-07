# Feature: Manager secondary screens + shared states

**From build-plan:** feature 21g (proposed)
**Status:** not started

## Goal

Finish the authenticated app: staff detail, workplace settings, manager profile,
and every shared state screen, so nothing in the app still looks neobrutalist.

## Design reference

- [../screens/manager-staff-detail.png](../screens/manager-staff-detail.png)
- [../screens/manager-workplace.png](../screens/manager-workplace.png) (form
  column only; the map is out of scope; it is build-plan item 22)
- Prototypes: `prototypes/staff-detail.html`, `prototypes/workplace.html`

## In scope

- **Staff detail** (`app/manager/staff/[id]/page.tsx`,
  `staff-shift-history.tsx`): profile card (large avatar, role eyebrow,
  Newsreader name, status badge, email), summary tiles only for values already
  computed, shift history table with clock-in and clock-out cells (mono time
  plus "Inside · 42 m"), duration (warning badge for long shifts), notes with
  mono IN and OUT tags.
- **Workplace settings** (`workplace-settings-form.tsx`): page header ("Where
  your team clocks in" plus the server-check explanation); a single form card
  with grouped sections (Details, Location, Clock-in radius) separated by
  hairlines; mono inputs for coordinates; the radius value in mono ocean; the
  hint text; saved and error messages keep their existing transitions.
- **Manager profile** (`app/manager/profile/page.tsx`).
- **Shared states**: `empty-state.tsx`, `forbidden-state.tsx`, `app/error.tsx`,
  `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx`,
  `app/offline/page.tsx`: centered card on paper, Newsreader title, muted body,
  one clear action, the 21b icon in a soft circle.

## Out of scope

- The stylized map and radius presets from the workplace prototype. Radius
  presets are new behaviour; propose them as a separate fix if wanted.
- Any change to validation, the geofence, or the API.

## Build steps

- [ ] **Step 1 - Staff detail** - *Done when:* the page matches the prototype
  layout at 1440px, the history table scrolls horizontally inside its card at
  390px rather than overflowing the page, and the back crumb returns to the
  dashboard.
- [ ] **Step 2 - Workplace settings** - *Done when:* the form saves, errors show
  per field with `aria-describedby` intact (11a), and the layout matches the
  prototype's form column.
- [ ] **Step 3 - Manager profile** - *Done when:* it uses the shared profile card
  restyled in 21e.
- [ ] **Step 4 - Shared states** - *Done when:* forcing each state (empty
  table, a worker visiting a manager URL, a thrown error, an unknown URL, the
  offline page) shows the new treatment.

## Files / areas

`app/manager/staff/[id]/page.tsx`, `app/manager/workplace/page.tsx`,
`app/manager/profile/page.tsx`, `components/manager/staff-shift-history.tsx`,
`components/manager/workplace-settings-form.tsx`, `components/shared/*`,
`app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx`,
`app/offline/page.tsx`.

## Data / contracts

None.

## Testing

- Workplace form validation is existing logic with existing tests; keep them
  green. No new logic.
- Evidence: screenshots of each page and each forced state.

## Notes for the AI

- `global-error.tsx` renders outside the root layout, so it cannot rely on
  `next/font` variables from `layout.tsx`; give it a safe font stack.
- The offline page is served by the service worker from the static shell; keep
  it free of any data fetch.
