# Feature: Commissioned imagery + share image

**From build-plan:** feature 21i (proposed)
**Status:** not started

## Goal

Replace the interim public-domain paintings with images made for ShiftBeacon's
own use case (care homes, arrival, handover), refresh the Open Graph image, and
update the README screenshots, so the product's look is its own.

## Design reference

- [../image-prompts.md](../image-prompts.md) (prompts, sizes, file names, slots)

## In scope

- Generate each image in `image-prompts.md` (outside the repo), review it
  against the checklist there, and export it at the listed size.
- Optimize: AVIF and WebP through `next/image` at build; keep the source JPEG at
  quality 80 and no wider than 2400px. Every image under 400 KB as committed.
- Swap the interim paintings slot by slot (`public/images/marketing/*`,
  `public/images/app/*`), keeping the same `sizes` and aspect ratios.
- `app/opengraph-image.tsx`: the hero image as a full-bleed background, a paper
  panel with the mark and the headline, 1200x630.
- Optional slots (offline page, empty states) only if the images pass review.
- Update `docs/screenshots/*` and the README Screenshots table.
- Remove the interim paintings once nothing references them, and update the
  footer credits line.

## Out of scope

- New layout. Image slots and aspect ratios are fixed by 21f and 21h.

## Build steps

- [ ] **Step 1 - Hero + platform band** - *Done when:* both slots show the new
  art with no layout shift and the floating cards still sit on calm areas.
- [ ] **Step 2 - How it works + why cards** - *Done when:* all five small slots
  show new art that reads at 390px.
- [ ] **Step 3 - Dashboard banner + footer strip** - *Done when:* both fade
  correctly into the paper background.
- [ ] **Step 4 - Share image** - *Done when:* the Open Graph image renders at
  `/opengraph-image`, and a link preview (any OG debugger) shows it.
- [ ] **Step 5 - README screenshots** - *Done when:* the README table shows the
  redesigned landing, worker home, dashboard, and workplace screens.

## Files / areas

`public/images/**`, `app/opengraph-image.tsx`, `components/marketing/*` and
`components/manager/*` image references, `docs/screenshots/*`, `README.md`.

## Data / contracts

**Load-bearing:** the file names and aspect ratios listed in
`image-prompts.md`. Layout code references them.

## Testing

- No logic. Evidence: screenshots, file sizes, and the OG preview.

## Notes for the AI

- Generated images must not contain text, logos, identifiable real people, real
  care home names, or UI. Reject and regenerate any that do.
- Treat generated people as illustrative: no medical procedures, no residents in
  distress, no visible faces in close-up.
