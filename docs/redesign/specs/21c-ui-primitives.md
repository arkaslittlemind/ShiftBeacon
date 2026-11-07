# Feature: UI primitives

**From build-plan:** feature 21c (proposed)
**Status:** not started

## Goal

Restyle the shadcn primitives in `components/ui/*` so every screen built from
them inherits the Pourville look and the motion rules, before the screens
themselves are touched.

## Design reference

- [../tokens/kit.css](../tokens/kit.css): `.btn*`, `.card`, `.badge*`, `.chip`,
  `.segmented`, `.input`, `.textarea`, `.table`, `.avatar`
- [../motion-and-polish.md](../motion-and-polish.md): press, menu, and sheet rows

## In scope

| Primitive | Pourville treatment |
| --- | --- |
| `button.tsx` | Sentence case, Inter 600, no border, 10px radius, soft shadow on solid variants. Variants: `default` (ink), `ocean` (new, Pourville blue, for Clock In), `outline` (white, hairline), `ghost` (transparent, muted text), `destructive` (coral), `link`. Sizes keep their heights; `lg` is 52px with 14px radius. Press: `scale(0.97)` at `--dur-press` / `--ease-out`; colours on `ease` at `--dur-fast`. `touch-action: manipulation` |
| `card.tsx` | White, 1px hairline, 16px radius, `--shadow-sm`; no offset shadow |
| `badge.tsx` | Pill, 24px tall, 12px text, variants `neutral`, `ocean`, `success`, `warning`, `danger`, each on its soft tint; optional leading dot |
| `input.tsx`, `textarea.tsx` | White, 1px `--input` border, 10px radius; focus: `--ocean` border plus the `--ring` glow; `aria-invalid` uses `--danger` |
| `table.tsx` | Mono uppercase 11px header in `--faint`, hairline row dividers, row hover `--surface-alt` (pointer devices only) |
| `dropdown-menu.tsx` | White, hairline, `--shadow`, 12px radius; enter `scale(0.96)` plus opacity at 150ms from the Radix transform origin; exit 100ms |
| `sheet.tsx` | Paper background, `--ease-drawer` 300ms in, 200ms out; overlay fades only |
| New: `segmented.tsx` | The range control from the dashboard prototype with a sliding indicator (`translateX`, 200ms `--ease-in-out`), `role="radiogroup"` semantics |

## Out of scope

- Using the new primitives on screens (21d onwards).
- Charts (21f).

## Build steps

- [ ] **Step 1 - Button** - rewrite the `cva` variants and sizes; add `ocean`.
  *Done when:* every variant renders at rest, hover, focus, active, and
  disabled on a scratch page or in the existing screens, and pressing shows the
  0.97 scale with no positional shift.
- [ ] **Step 2 - Card + badge** - *Done when:* dashboard cards show hairline
  plus soft shadow, and all five badge variants pass 4.5:1 contrast on their tint.
- [ ] **Step 3 - Input + textarea** - *Done when:* focus shows the blue ring,
  and an invalid workplace field shows the coral border with its message.
- [ ] **Step 4 - Table** - *Done when:* the staff table matches the prototype
  header and row treatment, and rows do not stay highlighted after a tap on a
  phone.
- [ ] **Step 5 - Dropdown + sheet motion** - *Done when:* the user menu grows
  from its trigger and closes faster than it opens; the mobile sheet slides in
  on the drawer curve; with reduced motion both only fade.
- [ ] **Step 6 - Segmented control** - new component, not yet used anywhere
  unless a screen already has an equivalent. *Done when:* arrow keys move the
  selection, the indicator slides, and `aria-checked` follows.

## Files / areas

`components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`,
`textarea.tsx`, `table.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, new
`components/ui/segmented.tsx`.

## Data / contracts

**Load-bearing:** the button variant names (`default`, `ocean`, `outline`,
`ghost`, `destructive`, `link`) and badge variant names (`neutral`, `ocean`,
`success`, `warning`, `danger`). Screens in 21d to 21h depend on them. If a
renamed variant is referenced today, update the call sites in the same step.

## Testing

- Variant styling is UI, so no unit tests. The segmented control's keyboard
  handling is behaviour: add a component test (`segmented.test.tsx`) for arrow
  keys and `aria-checked`.
- Existing component tests must stay green; they query by role and text.

## Notes for the AI

- shadcn components here are customized copies; edit them in place.
- Never `transition: all`. Name the properties.
- Hover styles go through the `hover:` variant, which is already limited to
  pointer devices.
