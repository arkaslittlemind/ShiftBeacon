# Feature: Worker screens

**From build-plan:** feature 21e (proposed)
**Status:** not started

## Goal

Restyle the care worker's home, the headline attendance flow, so clocking in and
out is calm, obvious, and confirms itself, on a phone first.

## Design reference

- Ready, inside the perimeter: [../screens/worker-home-inside.png](../screens/worker-home-inside.png)
- Outside the perimeter: [../screens/worker-home-outside.png](../screens/worker-home-outside.png)
- On shift: [../screens/worker-home-active.png](../screens/worker-home-active.png)
- Phone: [../screens/worker-home-mobile.png](../screens/worker-home-mobile.png)
- Prototype: `prototypes/worker-home.html` (state toggle at the top)

## In scope

- **Layout**: greeting header (mono date eyebrow, Newsreader "Morning, Amara" or
  "You're on shift"), a main shift card, and a side column (this week, recent
  shifts) that stacks under the card below 860px.
- **Shift card** (`clock-in-panel.tsx`, `active-shift-panel.tsx`): workplace
  row (icon tile, name, radius, status badge); the perimeter illustration (two
  rings and a "you" dot, inside or outside) built in CSS; the perimeter status
  banner; the note field with its existing hint; the main action; the privacy
  footer line ("Your location is only checked when you tap...").
- **Perimeter banner** (`perimeter-status-banner.tsx`): success tint when
  inside, coral tint when outside with the distance and the radius, icon plus
  text (never colour alone), `aria-live="polite"`, entrance per the motion rules.
- **Main action**: one button element that changes state. Ready: `ocean`
  variant "Clock in". Outside: disabled, with "Check my location again" as an
  outline button below. On shift: `default` (ink) "Clock out". Label crossfade
  with a 2px blur on state change.
- **Active shift**: large JetBrains Mono timer with tabular figures, "Clocked in
  at 06:58 · inside, 42 m" below it.
- **History** (`shift-history-card.tsx`): date tile (day number and weekday),
  mono time range, note excerpt with a file icon, mono duration.
- **This week** strip: hours total and seven day blocks (worked, off, today),
  if the data is already on the page; otherwise out of scope.
- **Worker profile** (`app/worker/profile/page.tsx`, `components/shared/profile-card.tsx`):
  card with avatar, name, email, role, organization.

## Out of scope

- Any change to geolocation, clock-in validation, or the API.
- New data for the "This week" strip if the page does not already load it.
- The installed-PWA compact layout (not built today; separate decision).

## Build steps

- [ ] **Step 1 - Page layout + greeting** - *Done when:* the two-column layout
  matches the prototype at 1440px and stacks cleanly at 390px with no
  horizontal scroll.
- [ ] **Step 2 - Shift card, ready and outside states** - workplace row,
  perimeter illustration, banner, note, action, privacy line. *Done when:* in
  the real app, a location inside the radius shows the inside state and one
  outside shows the outside state with the real distance, and a screen reader
  announces the banner text on change.
- [ ] **Step 3 - Active shift + state morph** - timer and Clock out, label
  crossfade. *Done when:* clocking in turns the same button from blue "Clock in"
  to ink "Clock out" without a layout jump, the timer digits do not shift width,
  and with reduced motion the change is a plain fade.
- [ ] **Step 4 - History + this week** - *Done when:* recent shifts match the
  prototype rows, and an empty history shows the shared empty state.
- [ ] **Step 5 - Worker profile** - *Done when:* the profile page uses the new
  card and header at both widths.

## Files / areas

`app/worker/home/page.tsx`, `app/worker/profile/page.tsx`,
`components/worker/*`, `components/shared/profile-card.tsx`,
`components/shared/empty-state.tsx` (only if needed here).

## Data / contracts

None new. The perimeter state comes from the existing client geolocation result
and server response.

## Testing

- Component tests for the worker panels already cover loading, error, empty,
  and success states. They must stay green; update them only where visible text
  changes (keep the copy unless the prototype changes it).
- Evidence: real-device check of clock in and clock out on a phone over HTTPS
  (geolocation needs a secure context), plus screenshots of all three states at
  390px. Run `npm run test:e2e` only if asked.

## Notes for the AI

- Location is requested only when the worker taps, with the existing
  explanation. Do not add any background or automatic location checks.
- The coral outside state must also say it in text, not only colour.
- Keep the 44px minimum touch target for every action.
