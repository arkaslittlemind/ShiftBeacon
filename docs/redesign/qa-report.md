# Pourville QA report (feature 21j)

The audit record for the redesign's motion, contrast, accessibility, and
device checks. Rules come from [motion-and-polish.md](motion-and-polish.md).
Each section is filled in by the build step named in its heading.

## 1. Static sweep

Run over `app/` and `components/` (`*.tsx`, `*.ts`, `*.css`) on the 21j branch.

| Rule | Search | Result |
| --- | --- | --- |
| No `transition: all` | `transition-all`, `transition: all`, `transition-property: all` | No matches |
| No `ease-in` | `ease-in` (excluding `ease-in-out`), `cubic-bezier(0.4, 0, 1` | No matches |
| No enter from `scale(0)` or below 0.95 | `scale-0`, `scale(0)`, `zoom-in-` below 95, `scale-[0.x]` | No matches |
| Animate no size or spacing properties | `transition-[...height/width/padding/margin]`, accordion keyframes | No matches |
| No keyframes outside tokens | `@keyframes` in `app/globals.css` | None defined |
| Only `animate-spin` beyond `animate-in` and `animate-out` | `animate-*` | One use: the spinner |
| Hover only on pointer devices | `:hover`, `group-hover`, `[&:hover]` outside the custom variant | Only the variant definition itself (`app/globals.css`) |
| UI durations at or under 300ms | `duration-*` values other than the four tokens | No matches |
| Blur at most 12px, marketing only | `backdrop-blur`, `backdrop-filter` | One hit fixed, below |

**Fixed:** `components/manager/welcome-banner.tsx` blurred a chip on the manager
dashboard (an app surface) with `backdrop-blur-[6px]`. The blur is removed and
the chip background raised from 82 to 92 percent opacity so the number stays
legible over the painting. The remaining blurs are on the marketing page:
`glass-frame.tsx` (12px) and `site-header.tsx` (10px).

## 2. Motion rows

Every row of the review table in [motion-and-polish.md](motion-and-polish.md).
"Source" means confirmed by reading the code; "Browser" means confirmed from
computed styles in a real browser (Playwright, Chromium) against the running
app. The slow-motion column says what to look for when stepping the DevTools
Animations panel to 10 percent; that visual pass is a human check.

| Row | Status | Verified | Slow-motion check |
| --- | --- | --- | --- |
| Button press scale 0.97 in 160ms, colours 150ms | Fixed, then done | Browser: the press scale was jumping to 0.97 with no easing (see the fix below); after the fix it eases 1, 0.974, 0.970 across three 30ms samples | Press a button: it shrinks smoothly and returns without a lag on the colour |
| Hover only on pointer devices | Done | Source: `hover` custom variant in `globals.css`, no raw `:hover` elsewhere | On a phone, tap a card or button: no hover style sticks |
| Tap handling on pressables | Done | Source: `touch-manipulation` and transparent tap highlight in the shared `Button` | Phone checklist (section 4) |
| Reduced motion keeps fades, drops movement | Done | Source: rule at `globals.css` (`prefers-reduced-motion`); audited in section 3 | Section 3 |
| Hero one-time entrance, 60ms stagger, 300ms | Done | Source: `hero.tsx` (`animate-in`, delays 0 to 300ms) | Reload the landing page: headline, lede, button, checks, then the two floating cards |
| Perimeter status enters with a rise and `aria-live` | Done | Source: `perimeter-status-banner.tsx` (`role="status"`, 200ms) | Move in and out of the radius: the banner rises 4px as it fades in |
| Clock In to Clock Out as one button, label crossfade with blur | Done | Source: `shift-card.tsx` (opacity and `filter` 200ms, blur dropped under reduced motion) | Clock in: one control changes, no second button swapping in |
| Timer digits do not jitter | Done | Source: `tabular-nums` on the timer and clock-in time | Watch the timer tick: nothing shifts sideways |
| Dropdown grows from its trigger | Done | Source: `dropdown-menu.tsx` (origin variable, 0.96 scale, 150ms in, 100ms out) | Open the user menu: it grows from the avatar |
| Mobile sheet uses the drawer curve | Done | Source: `sheet.tsx` (`--ease-drawer`, 300ms in, 200ms out) | Open the nav at 390px: smooth slide, quicker close |
| Segmented range control with a sliding indicator | Not applicable | Source: no segmented control, tablist, or range selector exists in `components/` | The control only existed in the prototype |
| Route changes keep a short crossfade | Done | Source: view-transition rules at `globals.css` (200ms) | Click between Dashboard and Workplace: a quick crossfade |
| No animation on keyboard-initiated actions | Done | Source: no custom motion on Enter or Escape handlers; only the component defaults | Submit the Ask card with Enter: the answer fades in, nothing else moves |
| FAQ answer fade and chevron turn, no height animation | Done | Source: `faq.tsx` (native `details`, 200ms fade, chevron rotate) | Open a question: the text fades in and the chevron turns |
| Blur at most 12px, marketing only | Done | Source and sweep (section 1): 12px glass frame, 10px header; the dashboard chip blur was removed | None |
| Ask answer fades in, fast spinner | Done | Source: `ask-card.tsx` (200ms fade), `Spinner` is a 1s `animate-spin` | Ask a question: the spinner turns steadily, then the answer fades in |
| Live dot pulse | Done | Browser: the header badge dot has `live-dot` at `2s infinite` and its opacity swings 0.3 to 1; the 2 row dots do not pulse; with reduced motion the animation is `none` | Watch the Staff card header badge: only that dot breathes |
| Paintings through `next/image` with a blur placeholder | Done | Source: `painting.tsx` and `welcome-banner.tsx` (`placeholder="blur"`, explicit `sizes`) | Throttle the network: a soft colour shows before each painting |

**Added in this step:** the Live dot pulse. `Badge` gains an optional `pulse`
prop (default off) that animates the dot with the new `animate-live-dot`
utility, an opacity-only 2s loop. It is switched off in the reduced-motion
block, next to `animate-spin`. Only the staff card's header badge uses it; the
per-row "On shift" badges stay still, because fifty pulsing dots would be noise.

**Fixed: the button press never animated.** `button.tsx` transitioned
`transform`, but the Tailwind v4 `scale-[0.97]` utility sets the individual
`scale` property, so the press snapped instantly. The transition now names
`scale`. Measured in Chromium with a real mouse press on the hero button, the
scale before the fix went from `none` to `0.97` on the first sample; after, it
eases `1`, `0.974`, `0.970`, `0.970`. Other press and menu motion uses
`transition-[opacity,translate]` or Tailwind's own `transition-transform`
(which lists `transform, translate, scale, rotate`), so it was not affected.

## 3. Contrast and reduced motion

### Contrast

Every text token against every surface it is used on, computed from the hex
values in `app/globals.css` with the WCAG 2.x relative-luminance formula.
Translucent text on the ink bands is blended onto the ink first. The threshold
is 4.5:1; the large display type (24px and up) has a 3:1 threshold, but every
pair below also clears 4.5:1, so no pair relies on it.

| Text | Surface | Ratio | Result | Where it appears |
| --- | --- | --- | --- | --- |
| `foreground` | `background` | 15.11 | pass | body and headings |
| `foreground` | `card` | 16.32 | pass | body and headings |
| `foreground` | `surface-alt` | 14.21 | pass | body and headings |
| `foreground` | `secondary` | 13.73 | pass | body and headings |
| `foreground` | `muted` | 14.21 | pass | body and headings |
| `foreground` | `ocean-soft` | 13.88 | pass | body and headings |
| `foreground` | `success-soft` | 14.04 | pass | body and headings |
| `foreground` | `warning-soft` | 14.13 | pass | body and headings |
| `foreground` | `danger-soft` | 13.71 | pass | body and headings |
| `muted-foreground` | `background` | 7.38 | pass | secondary copy, neutral badge, captions |
| `muted-foreground` | `card` | 7.98 | pass | secondary copy, neutral badge, captions |
| `muted-foreground` | `surface-alt` | 6.95 | pass | secondary copy, neutral badge, captions |
| `muted-foreground` | `secondary` | 6.71 | pass | secondary copy, neutral badge, captions |
| `muted-foreground` | `muted` | 6.95 | pass | secondary copy, neutral badge, captions |
| `faint` | `background` | 5.24 | pass | tertiary copy, timestamps |
| `faint` | `card` | 5.66 | pass | tertiary copy, timestamps |
| `faint` | `surface-alt` | 4.93 | pass | tertiary copy, timestamps |
| `faint` | `secondary` | 4.76 | pass | tertiary copy, timestamps |
| `faint` | `muted` | 4.93 | pass | tertiary copy, timestamps |
| `ocean` | `background` | 5.86 | pass | links, active, data, ocean badge |
| `ocean` | `card` | 6.33 | pass | links, active, data, ocean badge |
| `ocean` | `surface-alt` | 5.52 | pass | links, active, data, ocean badge |
| `ocean` | `ocean-soft` | 5.39 | pass | links, active, data, ocean badge |
| `success` | `background` | 5.40 | pass | inside, on shift |
| `success` | `card` | 5.84 | pass | inside, on shift |
| `success` | `surface-alt` | 5.08 | pass | inside, on shift |
| `success` | `success-soft` | 5.02 | pass | inside, on shift |
| `warning` | `background` | 5.21 | pass | long shift |
| `warning` | `card` | 5.63 | pass | long shift |
| `warning` | `warning-soft` | 4.87 | pass | long shift |
| `danger` | `background` | 5.25 | pass | outside, error |
| `danger` | `card` | 5.67 | pass | outside, error |
| `danger` | `surface-alt` | 4.94 | pass | outside, error |
| `danger` | `danger-soft` | 4.76 | pass | outside, error |
| `primary-foreground` | `primary` | 16.32 | pass | ink button, Clock In button |
| `primary-foreground` | `ocean` | 6.33 | pass | ink button, Clock In button |
| `danger-ink` | `danger` | 5.67 | pass | destructive button |
| `primary-foreground` at 70% | `primary` | 8.56 | pass | trust bar and AI section labels |
| `primary-foreground` at 75% | `primary` | 9.71 | pass | AI section lede |
| `primary-foreground` at 80% | `primary` | 10.85 | pass | trust bar names |

**40 pairs, 0 failures. The lowest is `faint` on `secondary` at 4.76:1.**

Not measured: text on the frosted `--glass` panels over paintings (marketing
hero cards). The text there is `foreground` on a 72 percent white panel over a
mid-tone painting, and a token pair cannot capture a photographic background.
Lighthouse's accessibility run (section 4) covers the rendered result.

### Reduced motion

`prefers-reduced-motion: reduce` emulated in Chromium and compared with the
same elements under `no-preference`:

| Element | Normal | Reduced |
| --- | --- | --- |
| Hero headline entrance | `enter` animation, rises 8px | Same animation, rise is `0`: fade only |
| Button `transition-property` | `scale, background-color, color, ...` | `opacity, color, background-color, ...` (no scale or transform) |
| FAQ chevron | `transform, translate, scale, rotate` | `opacity, color, ...` (no rotation animation) |
| Perimeter banner | `opacity, translate` | `opacity, color, ...` (fades, no rise) |
| Live dot pulse | `live-dot` 2s infinite | `none` |
| Button press | `motion-safe:` scale 0.97 | No scale at all (the class is `motion-safe` only) |

Movement is dropped everywhere and opacity and colour fades remain, as the
rule asks. The clock button label crossfade drops its 2px blur under reduced
motion through `motion-reduce:starting:blur-none` in `shift-card.tsx` (source
only: it appears on the worker screen with an active shift).

## 4. Lighthouse accessibility and phone checklist

### Lighthouse

Lighthouse 13.6.0, accessibility category only, default mobile emulation.
Run against the local dev server (`next dev` on `localhost:3000`), because the
Auth0 callbacks only allow that port. Signed-in pages carry the session cookie
from a Playwright login as a request header. Accessibility scores do not depend
on minification, but **performance was not measured**: it needs a production
build and was out of the done-when.

| Page | Score |
| --- | --- |
| Landing page (`/`) | 100 |
| Manager dashboard (`/manager/dashboard`) | 100 |
| Worker home (`/worker/home`) | 100 |

**Found and fixed: label in name.** The first signed-in runs scored 100 but
listed one unscored finding, `label-content-name-mismatch` (WCAG 2.5.3), on the
user menu button. On a phone the button shows only the initials (for example
"JE") while its `aria-label` was "Open user menu", so a speech-control user
saying the visible text would not hit it. In `components/shell/user-menu.tsx`
the avatar layout's label is now "<initials>, open user menu", and the inline
and card layouts, which show the name, take their accessible name from their
visible text. The re-run lists no failing audits on either signed-in page.

### Phone checklist (for a real device)

Run on Android Chrome and iOS Safari, as a signed-in care worker on the worker
home screen. This is a human check: the agent cannot hold a phone.

- [ ] Tap Clock in: no grey tap-highlight flash (Android).
- [ ] Double-tap the Clock in button quickly: the page does not zoom.
- [ ] Tap a card or button and lift your finger: no hover style stays behind.
- [ ] Press and hold a button: it shrinks slightly and eases back on release.
- [ ] Clock in: the label changes in place with a short crossfade, and nothing
      below the button jumps.
- [ ] Clock out: the same, with the colour moving from blue back to ink.
- [ ] Walk in and out of the radius (or change the workplace radius): the
      status banner fades in with a small rise and is announced by a screen
      reader.
- [ ] Turn on Reduce Motion in the phone's settings and repeat the clock in:
      the label and banner fade, with no blur or rise.

## 5. Evidence pack

Screenshots of every screen at 1440px and 390px (full page), with staff names
and the workplace coordinates replaced in the page before capture so no
personal data appears. Saved to `blueprint/reference/21j-evidence/`, which is
gitignored on purpose; the files are not part of the repository.

| Screen | Route | Files |
| --- | --- | --- |
| Marketing landing | `/` | `landing-1440.png`, `landing-390.png` |
| Offline | `/offline` | `offline-1440.png`, `offline-390.png` |
| Not found | any unknown path | `not-found-1440.png`, `not-found-390.png` |
| Manager dashboard | `/manager/dashboard` | `manager-dashboard-1440.png`, `manager-dashboard-390.png` |
| Manager staff detail | `/manager/staff/[id]` | `manager-staff-detail-1440.png`, `manager-staff-detail-390.png` |
| Manager workplace | `/manager/workplace` | `manager-workplace-1440.png`, `manager-workplace-390.png` |
| Manager profile | `/manager/profile` | `manager-profile-1440.png`, `manager-profile-390.png` |
| Worker home (inside the perimeter, not clocked in) | `/worker/home` | `worker-home-1440.png`, `worker-home-390.png` |
| Worker profile | `/worker/profile` | `worker-profile-1440.png`, `worker-profile-390.png` |
| Forbidden (a worker opening a manager page) | `/manager/dashboard` as a worker | `forbidden-worker-on-manager-1440.png`, `forbidden-worker-on-manager-390.png` |

Not captured: the global error screen (it needs a forced server exception) and
the loading screen (it is on screen for a fraction of a second). Captured
against the dev server with its development badge hidden, not a production
build.
