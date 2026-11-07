# Feature: Manager dashboard

**From build-plan:** feature 21f (proposed)
**Status:** not started

## Goal

Rebuild the dashboard's look around the Hearth-style layout the user supplied,
in the Pourville system: a painted welcome banner, quiet stat tiles, the live
staff table, the two charts, and the two AI cards.

## Design reference

- [../screens/manager-dashboard.png](../screens/manager-dashboard.png)
- Prototype: `prototypes/manager-dashboard.html`

## In scope

- **Welcome banner**: white card; left: mono date eyebrow, Newsreader "Good
  morning, {first name}", one-line status summary built from data already on
  the page ("14 of 17 rostered staff are on the floor"), two actions (ink "View
  on shift", outline "Read handover") that scroll to their sections. Right: the
  painting, masked to fade in from the left, with a frosted "on shift now" count
  chip. Interim art: `img/cliff-walk.jpg` moved to `public/images/`; 21i swaps it.
- **Range control**: the 21c segmented control only if the page already
  supports a range; otherwise omit it (no new query in this feature).
- **Stat tiles**: mono uppercase label plus an icon, large number, a sub-line or
  a status badge. One tile per metric already computed.
- **Staff on shift table** (`staff-table.tsx`): person cell (avatar initials,
  name, role), clocked-in time in mono, duration (warning badge past the
  existing long-shift threshold, if one exists), location as "Inside · 42 m"
  with a pin icon, note, row link to staff detail.
- **Charts** (`daily-clock-ins-chart.tsx`, `staff-hours-chart.tsx`,
  `average-hours-card.tsx`): bars in `--chart-3` with today in `--chart-1`,
  `--chart-grid` gridlines, mono 11px ticks in `--faint`, tooltip as a white
  card with hairline. Keep the accessible chart descriptions from 11a.
- **Handover digest card** (`handover-digest-card.tsx`): sparkle icon title,
  "AI" ocean badge, mono meta line (date, note count, generated time), summary,
  key points with check icons, flags in a warning-tint block. Unavailable and
  empty states restyled, same copy.
- **Ask card** (`ask-card.tsx`): question input with the send button inside the
  field, starter chips, the answer block on an ocean-soft surface with a mono
  source line, loading spinner (21b), rate-limited and unavailable states.
  Answers stay plain text.

## Out of scope

- New metrics, the sidebar "On shift now" list, or any new query.
- Changes to the digest or ask services, prompts, rate limits, or caching.

## Build steps

- [ ] **Step 1 - Banner + tiles** - *Done when:* the banner and tiles match
  the prototype at 1440px, the painting loads through `next/image` with a blur
  placeholder and no layout shift, and the banner stacks at 390px with the
  painting as a short strip below the text.
- [ ] **Step 2 - Staff table** - *Done when:* rows match the prototype, the
  whole row is a keyboard-focusable link to staff detail, and the empty state
  shows when nobody is on shift.
- [ ] **Step 3 - Charts** - *Done when:* both charts use the chart tokens, the
  current day is highlighted, and tooltips match the card style.
- [ ] **Step 4 - Handover digest card** - *Done when:* ready, empty, and
  unavailable states all render in the new style with unchanged copy.
- [ ] **Step 5 - Ask card** - *Done when:* idle, loading, answer, cached
  answer, rate-limited, and unavailable states all render; the answer fades in
  (200ms); Enter submits with no extra animation.

## Files / areas

`app/manager/dashboard/page.tsx`, `components/manager/*` (dashboard cards and
charts), `public/images/` (interim painting).

## Data / contracts

None new. The status summary line uses values the page already loads.

## Testing

- Ask card and digest card component tests cover the states; keep them green,
  updating only for deliberate text changes.
- Evidence: screenshots at 1440px and 390px, plus each card state.

## Notes for the AI

- Answers and digest text are model output shaped by notes other people wrote.
  Render as plain text, never as HTML or markdown.
- The painting is decorative to the task: give it a short `alt` naming the work
  (Monet, The Cliff Walk at Pourville) or mark it decorative, not both.
