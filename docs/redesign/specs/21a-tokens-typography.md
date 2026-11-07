# Feature: Tokens + typography foundation

**From build-plan:** feature 21a (proposed)
**Status:** not started

## Goal

Port the Pourville tokens into the app's global stylesheet and switch the fonts,
so every later sub-feature builds on the new system. After this step the app
uses the new colours, hairlines, soft shadows, radii, and type. Components still
have their old structure (uppercase buttons, for example) until 21c.

## Design reference

- Tokens: [../tokens/theme.css](../tokens/theme.css) (source of truth)
- Primitives built from them: [../tokens/kit.css](../tokens/kit.css)
- Any screenshot in [../screens/](../screens/) for the overall feel
- Motion tokens: [../motion-and-polish.md](../motion-and-polish.md)

## In scope

- Replace the `:root` palette, radius, shadow, and border-width values in
  `app/globals.css` with the Pourville values, mapped onto the existing shadcn
  semantic names (table below), plus the new tokens Pourville adds.
- Fonts through `next/font/google` in `app/layout.tsx`: Newsreader (display,
  optical sizing, weights 300 to 500, roman and italic loaded for completeness),
  Inter (UI, unchanged), JetBrains Mono (data). Space Grotesk is dropped from
  `next/font`: the wordmark is an SVG, so the font is not needed at runtime.
- Motion tokens (`--ease-out`, `--ease-in-out`, `--ease-drawer`, durations,
  `--stagger`) and the refined reduced-motion rule (drop movement, keep opacity).
- Chart tokens `--chart-1` to `--chart-4` and `--chart-grid`, consumed by the
  Recharts components through their existing `var(--color-*)` references.
- Doc alignment: the `coding-standards.md` Styling section and
  `brand/README.md`. (`project-plan.md` section 6 and the overview were updated
  when feature 21 was approved.)
- The one-time logo recolour (decision 1): shield in `#1D6496`, outline and
  cross in `#16212B`. New mark colourways in `brand/`, the regenerated
  icon set in `public/icons/`, `app/icon.svg`, `app/apple-icon.png`,
  `app/favicon.ico`, and the hardcoded colours in
  `components/brand/shift-beacon-mark.tsx`.

## Out of scope

- Restyling component markup or class lists (21c onwards).
- Icons (21b).
- Any imagery.

## Build steps

- [ ] **Step 1 - Palette port** - replace the colour values in `app/globals.css`
  `:root` with the mapping below; add `--ocean*`, `--success*`, `--chart-*`,
  `--glass*` and expose them in `@theme inline` as `--color-*`. Update the
  hardcoded palette outside the stylesheet too: `viewport.themeColor` in
  `app/layout.tsx` (ink `#16212B`) and `background_color` / `theme_color` in
  `app/manifest.ts` (paper `#F8F6F1` / ink `#16212B`). *Done when:* the
  dashboard and worker home render on warm paper with ink text and hairline
  borders, and `npm run build` passes.
- [ ] **Step 2 - Shape and depth** - `--radius: 10px`, `--border-w: 1px`,
  `--border-w-lg: 1px`, soft `--shadow-sm/md/lg` from the tokens. *Done when:*
  no hard offset shadow remains anywhere in the app (spot-check dashboard,
  worker home, workplace, landing) and cards show a 1px hairline.
- [ ] **Step 3 - Fonts** - load Newsreader and JetBrains Mono through
  `next/font`, point `--font-display` / `--font-heading` at Newsreader and
  `--font-mono` at JetBrains Mono; Inter stays `--font-sans`. *Done when:* page
  titles render in Newsreader, timestamps in JetBrains Mono, and the network tab
  shows only self-hosted font files (no request to `fonts.googleapis.com`).
- [ ] **Step 4 - Motion tokens + reduced motion** - add the motion tokens and
  replace the reduced-motion block so it keeps opacity and colour fades and
  removes transforms. *Done when:* with OS reduced motion on, the route
  crossfade still fades and nothing slides or scales.
- [ ] **Step 5 - Docs** - update the `coding-standards.md` Styling section
  and run `/overview` so the overview's conventions match. *Done when:* no
  project doc still describes the neobrutalist system as current, apart from
  history files.
- [ ] **Step 6 - Logo recolour** - update the mark SVGs, the mark component,
  and `brand/README.md` (new fixed values, with a note that this was a one-time
  deliberate change), then regenerate the icon set. In `app/opengraph-image.tsx`,
  swap the hardcoded mint, slate, and Sea Green offset shadow for paper, ink,
  and a soft shadow so link previews match until 21i replaces the image.
  *Done when:*
  the favicon, PWA icons, and in-app marks all show the recoloured mark, and the
  PWA manifest icons still pass a Lighthouse installability check.

## Files / areas

- `app/globals.css`, `app/layout.tsx`, `app/manifest.ts`,
  `app/opengraph-image.tsx`
- `blueprint/context/coding-standards.md`, `blueprint/project-plan.md`,
  `blueprint/context/project-overview.md` (regenerated), `brand/README.md`
- `brand/*.svg`, `components/brand/shift-beacon-mark.tsx`,
  `public/icons/*`, `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico`

## Data / contracts

**Load-bearing:** the token names below. Every later sub-feature uses them.

| shadcn / app token | Pourville value |
| --- | --- |
| `--background` | `#F8F6F1` (paper) |
| `--foreground`, `--card-foreground`, `--popover-foreground` | `#16212B` (ink) |
| `--card`, `--popover` | `#FFFFFF` |
| `--primary` / `--primary-foreground` | `#16212B` / `#FFFFFF` (ink buttons) |
| `--secondary`, `--muted` | `#EFEBE3` / `#F2EFE8` |
| `--muted-foreground` | `#47525D` |
| `--faint` | `#5F6872` |
| `--accent` / `--accent-foreground` (shadcn hover surface) | `#F2EFE8` / `#16212B` |
| `--surface-alt` | `#F2EFE8` |
| `--border`, `--border-soft` | `#E6E1D6` |
| `--input` | `#D4CEC1` |
| `--ring` | `#1D6496` |
| `--ocean`, `--ocean-hover`, `--ocean-soft`, `--ocean-tint` (new) | `#1D6496`, `#164F78`, `#E4EEF6`, `#C6DBEB` |
| `--success`, `--success-soft` (new) | `#1A7166`, `#E3F1EC` |
| `--warning`, `--warning-soft` | `#8A5F17`, `#F6EEDC` |
| `--destructive` = `--danger`, `--danger-soft` | `#A84A39`, `#F8E8E2` |
| `--chart-1` to `--chart-4`, `--chart-grid` | `#1D6496`, `#6C9EC6`, `#C3D7E7`, `#4F9A8C`, `#ECE8DF` |

`--accent` keeps its shadcn meaning (a neutral hover surface) so the shadcn
primitives behave. The Pourville blue is `--ocean`, not `--accent`, to avoid
silently recolouring every shadcn hover state.

## Testing

- No logic-bearing code, so no new unit test. The existing suite must stay
  green (`npm test`); component tests assert roles and text, not colours.
- Evidence: before/after screenshots of the dashboard, worker home (inside and
  outside), and landing at 1440px and 390px, plus a contrast spot-check of
  muted and faint text on paper and on `--surface-sunk` (all must be 4.5:1 or
  better).

## Notes for the AI

- Tailwind v4 is CSS-first: tokens live in `@theme` in `globals.css`; there is no
  `tailwind.config.js`.
- Keep the existing `@custom-variant hover` block; it already limits hover to
  pointer devices.
- Do not rename existing tokens that components reference (`--border-soft`,
  `--surface-alt`, `--danger-ink`, `--accent-dark`); remap their values. Remove
  a token only once nothing references it.
- `--accent-dark` was Sea Green text on light green. Map it to `--ocean` and
  check every use reads correctly.
