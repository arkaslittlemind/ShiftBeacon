# Feature: Marketing landing rebuild

**From build-plan:** feature 21h (proposed)
**Status:** not started

## Goal

Replace the current landing page with the Leedlime-structured page from the
approved prototype, using the public-domain Monet paintings as interim art.

## Design reference

- [../screens/landing-desktop.jpg](../screens/landing-desktop.jpg),
  [../screens/landing-mobile.jpg](../screens/landing-mobile.jpg)
- Prototype: `prototypes/landing.html` (copy, structure, and section CSS)
- Leedlime: <https://leedlime.com/> (layout language only; do not copy its art,
  copy, or brand)

## In scope

Sections, top to bottom, each a component under `components/marketing/`:

| Section | Component | Notes |
| --- | --- | --- |
| Framed page | `app/page.tsx` | 1240px frame with hairline side borders |
| Sticky header | `site-header.tsx` | Paper with 90 percent opacity and blur, centered links, "Log in" and an ink "Request a demo" |
| Hero | `hero.tsx` | Split: Newsreader headline "Know exactly who's on shift, and where.", lede, large ink button, two success checks. Right: painting with two floating frosted cards (location check, on-shift table) |
| Trusted-by band | `trust-bar.tsx` | Ink band (decision 2); placeholder names stay geography-neutral |
| How it works | `how-it-works.tsx` | Three cards with painting tops and a mini UI on each |
| Platform | new `platform-band.tsx` | Dot-grid heading, then the dashboard preview in a frosted frame over a painting |
| Why | new `why-cards.tsx` | Two painting-framed UI cards: "Verified on site, not self-reported", "Live, not end of shift" |
| AI section | new `ai-section.tsx` | Ink band (decision 2), with the white chat card (greeting, question box, starter chips, sample answer) |
| Testimonial | new `testimonial.tsx` | Newsreader 300 quote |
| FAQ | new `faq.tsx` | Native `details`/`summary`, four questions from the prototype |
| Closing CTA | `cta-band.tsx` | Dot grid, Newsreader headline, ink button |
| Footer | `site-footer.tsx` | Four columns, credits line naming the paintings, painted strip |

- Remove `compare.tsx` and `features.tsx` once nothing imports them (their
  content moves into the Why and Platform sections).
- Paintings in `public/images/marketing/` through `next/image`: explicit
  `sizes`, `placeholder="blur"`, priority only for the hero painting.
- Hero entrance per the motion rules (60ms stagger, cards last).
- Metadata: keep the existing title and description unless the headline
  change calls for a new description.

## Out of scope

- The generated art (21i).
- A real demo-request form; the CTA keeps today's target.
- Pricing (ShiftBeacon has no pricing; see the overview's Monetization).

## Build steps

- [ ] **Step 1 - Frame, header, hero** - *Done when:* the first viewport
  matches the prototype at 1440px, the hero painting is the LCP element and
  loads with priority, and at 390px the cards stack over the painting without
  overflow.
- [ ] **Step 2 - Trust band + how it works** - *Done when:* both match the
  prototype at both widths.
- [ ] **Step 3 - Platform band + why cards** - *Done when:* both match, and the
  dashboard preview is static markup (no live data) with `aria-hidden` on purely
  decorative parts.
- [ ] **Step 4 - AI section + testimonial** - *Done when:* both match, and the
  sample answer is clearly an illustration (no live call).
- [ ] **Step 5 - FAQ, closing CTA, footer** - *Done when:* the FAQ works with
  the keyboard, the chevron rotates, answers fade in, and the footer credits the
  paintings.
- [ ] **Step 6 - Cleanup + performance** - remove dead marketing components.
  *Done when:* Lighthouse on the production build shows no layout shift from
  images and LCP under 2.5s on a desktop profile, and no unused component
  remains.

## Files / areas

`app/page.tsx`, `components/marketing/*`, `public/images/marketing/*`.

## Data / contracts

None.

## Testing

- UI only. Evidence: full-page screenshots at 1440px and 390px, Lighthouse
  report for performance and accessibility.

## Notes for the AI

- The landing page is a server component; only the FAQ chevron and entrance
  animation need client behaviour, and both can be CSS.
- Painting alt text names the work and artist; the credits line in the footer
  covers attribution.
- Placeholder customer names and the testimonial are illustrative; keep them
  geography-neutral (see the overview's open question about UK copy).
