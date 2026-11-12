# Motion and polish rules

The interaction rules every Pourville spec builds against. They come from a
design-engineering review of the v4 prototypes and the shipping components. The
prototypes in `prototypes/` already follow the "After" column; the app does not
yet.

The guiding idea: ShiftBeacon is a tool tired people use at the start and end of
a shift. Motion exists to confirm an action or explain a change of state, never
to decorate something a manager sees fifty times a day.

## Review

| Before | After | Why |
| --- | --- | --- |
| Button press moves the button `3px` down-right and drops its offset shadow (`components/ui/button.tsx`) | `transform: scale(0.97)` on `:active`, `transition: transform 160ms var(--ease-out)` | The offset-shadow press belongs to the old system. A subtle scale confirms the press without a hard edge to move |
| Prototype buttons: `transition: background 160ms, border-color 160ms, transform 160ms` on one curve | Transform on `--ease-out` at 160ms; colours on plain `ease` at 150ms | Colour changes are not movement. A strong ease-out curve on a colour fade reads as abrupt |
| `scale(0.98)` press | `scale(0.97)` | 0.98 is below the threshold where a press feels acknowledged on a phone |
| Hover rules apply on every device | Hover styles only inside `@media (hover: hover) and (pointer: fine)` (the app's `@custom-variant hover` already does this; keep it) | On a phone a tap triggers `:hover` and the style sticks after the finger lifts |
| No tap handling on worker buttons | `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on pressables | Removes the double-tap zoom delay and the grey flash on Android when clocking in |
| Reduced motion turns off every transition and animation | Reduced motion drops movement (transforms, slides) but keeps opacity and colour fades | Opacity changes aid comprehension and do not cause motion sickness. Zero feedback is worse |
| Hero content appears all at once | One-time entrance: opacity plus `translateY(8px)`, 300ms `--ease-out`, staggered 60ms (headline, lede, button, checks, then the floating cards) | First-view marketing content is seen rarely, so a short cascade earns its place. Never block interaction while it plays |
| Perimeter status swaps instantly between inside and outside | The status banner enters with opacity plus a 4px rise, 200ms `--ease-out`; the change is announced through `aria-live="polite"` | A state change the worker must notice should be visible as a change, not a silent swap |
| Clock In becomes Clock Out by replacing the button | Keep one button element; crossfade the label with `filter: blur(2px)` and opacity over 200ms while the colour shifts from blue to ink | The worker sees one control change state, not two controls swapping. Blur hides the overlap between the old and new labels |
| Active shift timer digits shift width as they tick | `font-variant-numeric: tabular-nums` (JetBrains Mono already has it); no animation on the tick | A ticking number must not jitter the layout, and a per-second animation would be noise |
| Dropdown menu (user menu) scales from centre | `transform-origin: var(--radix-dropdown-menu-content-transform-origin)`, enter from `scale(0.96)` plus opacity, 150ms `--ease-out`; exit 100ms | Menus should grow from their trigger. Exit faster than enter |
| Mobile nav sheet uses a generic ease | `--ease-drawer` (`cubic-bezier(0.32, 0.72, 0, 1)`) at 300ms in, 200ms out | The iOS-style drawer curve feels physical; a closing sheet should get out of the way faster than it arrived |
| Segmented range control (Today, This week, Last 7 days) jumps its selected background | A single indicator element slides with `transform: translateX()` at 200ms `--ease-in-out` | On-screen movement uses ease-in-out; animate one transform rather than two background colours |
| Sidebar navigation and route changes | Keep the existing short view-transition crossfade; no motion on the active-item highlight itself | Navigation happens many times a day. Anything slower than a quick crossfade makes the app feel slow |
| Keyboard actions (Enter to ask, Escape to close) | No animation tied to keyboard-initiated actions beyond what the component already does | Keyboard users repeat these constantly; motion makes them feel delayed |
| FAQ answers pop open | Answer text fades in over 200ms; the chevron rotates 180deg at 200ms `--ease-out`; no height animation | Animating height triggers layout every frame. Opacity alone reads as smooth |
| `backdrop-filter: blur(14px)` on large frosted panels | `blur(12px)` maximum, only on the marketing page, never on scrolling app surfaces | Large blurs are expensive in Safari and on low-end phones |
| Ask card answer replaces the loading text instantly | Answer fades in over 200ms; the loading indicator is a fast spinner or a shimmer, never a slow pulse | A faster spinner makes the wait feel shorter; a fade marks "new content arrived" |
| "Live" badge dot is static | Optional: a 2s opacity pulse on the dot only, disabled under reduced motion | The one place constant motion carries meaning (the list is live). Keep it to the dot |
| Trust bar names are a static row | Optional: a slow (60s) linear `translateX` marquee on the landing trust bar only; paused on hover, edges masked, a second set marked `aria-hidden`; under reduced motion it stops and shows the static wrapping row | Ambient motion, so a second constant-motion exception after the live dot. Transform only, marketing page only, never on app surfaces |
| Paintings load as plain `background-image` | `next/image` with `placeholder="blur"`, explicit `sizes`, and a reserved aspect ratio | No layout shift, a soft colour placeholder while the art loads, and responsive sizes on phones |

## Tokens

Defined in `tokens/theme.css` and ported in 21a:

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Enter, press, feedback |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movement on screen (segmented indicator) |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers |
| `--dur-press` | 160ms | Button press |
| `--dur-fast` | 150ms | Hover colour, tooltips |
| `--dur-base` | 200ms | Dropdowns, status changes, fades |
| `--dur-panel` | 300ms | Sheets, page-level entrance |
| `--stagger` | 60ms | Delay between staggered items |

## Rules

1. Animate only `transform`, `opacity`, `filter`, and colours. Never `height`,
   `width`, `padding`, or `margin`.
2. Never `transition: all`. Name the properties.
3. Never enter from `scale(0)`. Start at `0.95` or higher, with opacity.
4. UI motion stays under 300ms. Exits are faster than entrances.
5. Never use `ease-in` for UI.
6. Prefer CSS transitions over keyframes for anything that can be retriggered
   quickly, so it can be interrupted. Keyframes are fine for one-time entrances.
7. Hover styles go through the `hover` custom variant (pointer devices only).
8. Every animation has a reduced-motion path that keeps opacity and drops
   movement.
9. Popovers and menus scale from their trigger; modals and sheets do not.
10. Review new motion in slow motion (DevTools Animations panel at 10 percent)
    and on a real phone before approving the step.
