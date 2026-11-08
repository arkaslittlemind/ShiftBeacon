# ShiftBeacon logo assets

> **Tracked copy.** The design source lives in `ShiftBeacon-Logo-Concepts/`,
> which is gitignored; this folder is the committed copy the app builds against.
> The SVGs here have had their C2PA provenance metadata stripped (it was roughly
> 94% of each file) so they can be inlined cheaply. Only the assets the app
> actually uses are tracked; the full export set stays in the design source.

Mark: shield + location pin + medical cross, knockout (concept 2c).
Wordmark: Space Grotesk Bold, tagline Space Grotesk Medium, letter-spacing 0.22em.

## Colours

These are **fixed brand values**, not theme tokens. The logo must not change
colour if the UI is ever re-themed, so `components/brand/shift-beacon-mark.tsx`
hardcodes them rather than using token classes.

- Pourville blue `#1d6496` - the shield, and the field of the app icons
- Ink `#16212b` - the shield outline and the cross
- Mist `#eaf3f0` - the shield outline on dark grounds
- White `#ffffff` - the pin

> **One deliberate recolour (feature 21a, 2026-11-08).** The mark was Sea Green
> `#2e8b57` with an ink `#16262b` outline until the Pourville redesign. It was
> recoloured once, as a brand decision (`docs/redesign/README.md`, decision 1),
> and the cross changed from a knockout to solid ink in the full-colour mark and
> the app icons. Shape and wordmark are unchanged. The rule above still holds:
> do not re-theme the logo again without the same kind of decision.

## Files here

- `mark-full-colour.svg` - default: blue shield, ink outline, white pin, ink
  cross
- `mark-on-ink.svg` - for dark grounds: mist outline, ink pin, cross knocked
  out to the shield blue
- `mark-mono-ink.svg` - single-colour ink
- `mark-reverse-white.svg` - white shield, blue pin
- `app-icon-square.svg` - 512 square, blue field, white outline and pin, ink
  cross
- `favicon-32.svg` - simplified pin only, no shield outline
- `lockup-horizontal-trimmed.png` - the horizontal lockup with the export's
  white margin trimmed off (the raw export is 2157x384 with the art in the left
  45%). Used by `app/opengraph-image.tsx`.

## Where these ship

- `app/icon.svg` is `favicon-32.svg`
- `public/icons/icon-*.png` are rasterised from `app-icon-square.svg` (512 to
  48, with the outline stroke stepping up so it never renders under about 2px)
  and from `favicon-32.svg` (32 and 16, the pin-only silhouette). They are
  listed in `app/manifest.ts`. `app/apple-icon.png` is `icon-180.png`
- `public/icons/icon-512-maskable.png` is the 512 icon with the art scaled to
  76% so the shield clears the maskable safe circle
- `lockup-horizontal-trimmed.png` was recoloured from the Sea Green export
  pixel by pixel, so the Space Grotesk wordmark keeps the export's spacing; the
  design source in `ShiftBeacon-Logo-Concepts/` still holds the Sea Green
  originals
- `components/brand/shift-beacon-mark.tsx` inlines the paths from
  `mark-full-colour.svg` and `mark-on-ink.svg`

## Usage

- Clear space: half the shield height on all sides.
- Minimums: horizontal lockup 120px wide; mark alone 20px; tagline lockup 200px.
- Drop the tagline below 200px lockup width.
- Never rotate, stretch, or place the full-colour mark on a coloured ground.
