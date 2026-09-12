# ShiftBeacon logo assets

> **Tracked copy.** The design source lives in `ShiftBeacon-Logo-Concepts/`,
> which is gitignored; this folder is the committed copy the app builds against.
> The SVGs here have had their C2PA provenance metadata stripped (it was roughly
> 94% of each file) so they can be inlined cheaply. Only the assets the app
> actually uses are tracked; the full export set stays in the design source.

Mark: shield + location pin + medical cross, knockout (concept 2c).
Wordmark: Space Grotesk Bold, tagline Space Grotesk Medium, letter-spacing 0.22em.

## Colours

These are **fixed brand values**, not theme tokens. They currently equal the
`app/globals.css` palette, but the logo must not change colour if the UI is ever
re-themed, so `components/brand/shift-beacon-mark.tsx` hardcodes them rather
than using `fill-primary` and friends.

- Sea Green `#2e8b57`
- Ink `#16262b`
- Mist `#eaf3f0`
- Muted `#4d625f`

## Files here

- `mark-full-colour.svg` - default, green shield + ink outline
- `mark-on-ink.svg` - for dark grounds
- `mark-mono-ink.svg` - single-colour ink
- `mark-reverse-white.svg` - white on Sea Green
- `app-icon-square.svg` - 512 square, green field
- `favicon-32.svg` - simplified pin only, no shield outline
- `lockup-horizontal-trimmed.png` - the horizontal lockup with the export's
  white margin trimmed off (the raw export is 2157x384 with the art in the left
  45%). Used by `app/opengraph-image.tsx`.

## Where these ship

- `app/icon.svg` is `favicon-32.svg`
- `app/apple-icon.png` and `public/icons/icon-*.png` come from the design
  source's PNG export, listed in `app/manifest.ts`
- `public/icons/icon-512-maskable.png` is generated from `icon-512.png`, scaled
  to 76% so the shield clears the maskable safe circle
- `components/brand/shift-beacon-mark.tsx` inlines the paths from
  `mark-full-colour.svg` and `mark-on-ink.svg`

## Usage

- Clear space: half the shield height on all sides.
- Minimums: horizontal lockup 120px wide; mark alone 20px; tagline lockup 200px.
- Drop the tagline below 200px lockup width.
- Never rotate, stretch, or place the full-colour mark on a coloured ground.
