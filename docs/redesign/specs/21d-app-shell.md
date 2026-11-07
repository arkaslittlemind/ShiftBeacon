# Feature: App shell

**From build-plan:** feature 21d (proposed)
**Status:** not started

## Goal

Give both authenticated areas the Leedlime app chrome: a paper sidebar whose
selected item is a white card, a quiet topbar for managers, and a clean top nav
for workers, so every screen restyle afterwards sits in the right frame.

## Design reference

- Manager chrome: [../screens/manager-dashboard.png](../screens/manager-dashboard.png)
  (sidebar, crumb, topbar actions)
- Worker chrome: [../screens/worker-home-inside.png](../screens/worker-home-inside.png),
  phone: [../screens/worker-home-mobile.png](../screens/worker-home-mobile.png)
- `kit.css`: `.app`, `.sidebar`, `.nav`, `.nav-label`, `.user-card`, `.topbar`, `.crumb`

## In scope

- **Manager sidebar** (`manager-sidebar.tsx`, `manager-sidebar-content.tsx`):
  paper background, hairline right edge; brand lockup with the organization name
  as a small mono caption; a "Manage" label; nav items 38px tall with icon and
  label; the current item as a white card with hairline and soft shadow and an
  ocean icon; counts as small mono chips; settings and sign out at the bottom;
  the user card (avatar initials, name, role).
- **Manager topbar** (`manager-topbar.tsx`): crumb chip with the page icon and
  name, notifications button only if one exists today (do not add a fake one),
  the primary page action as an ink button where the page has one.
- **Worker top nav** (`worker-top-nav.tsx`): white bar with hairline, brand,
  "My shift" and "History" links with the white-card active state, user menu on
  the right.
- **Page header** (`page-header.tsx`): mono eyebrow (date or section), Newsreader
  title at 2.4 to 2.75rem, optional muted description.
- **User menu** (`user-menu.tsx`): restyled through the 21c dropdown; profile
  and sign out items.
- **Mobile**: the manager sheet uses the 21c sheet; touch targets stay at least
  44px (the 11b decision).

## Out of scope

- The "On shift now" list in the sidebar shown in the prototype. It needs live
  data in the layout; add it in 21f only if the dashboard data is already
  available there without a new query.
- Search (`Ctrl K`) in the prototype sidebar. Not a current feature.

## Build steps

- [ ] **Step 1 - Manager sidebar** - *Done when:* the sidebar matches the
  prototype at 1440px, the active route shows the white-card state, the real
  organization name shows (fix `manager-sidebar-org-name` must not regress), and
  keyboard focus is visible on every item.
- [ ] **Step 2 - Manager topbar + page header** - *Done when:* dashboard,
  staff, workplace, and profile all show the crumb and the Newsreader title with
  correct heading levels (one `h1` per page).
- [ ] **Step 3 - Worker top nav** - *Done when:* worker home and profile show
  the new bar at 1440px and 390px, with the active link state and the user menu.
- [ ] **Step 4 - Mobile sheet + user menu** - *Done when:* at 390px the manager
  menu opens the sheet with all nav items, the sheet closes on navigation, and
  the user menu grows from its trigger.

## Files / areas

`components/shell/*` (`manager-sidebar.tsx`, `manager-sidebar-content.tsx`,
`manager-topbar.tsx`, `worker-top-nav.tsx`, `page-header.tsx`, `user-menu.tsx`,
`logout-link.tsx`), `components/brand/brand-lockup.tsx`, `app/manager/layout.tsx`,
`app/worker/layout.tsx`.

## Data / contracts

None new. Reuse the organization name already passed to the sidebar.

## Testing

- UI only. The e2e suite (run only when asked) navigates by link text, so keep
  link names unchanged ("Dashboard", "Workplace", and so on).
- Evidence: screenshots of both shells at 1440px and 390px, sheet open and closed.

## Notes for the AI

- Server components by default; the sheet and menu are already client components.
- The route crossfade (`route-transition.tsx`) stays as is; no motion on the
  active nav highlight.
