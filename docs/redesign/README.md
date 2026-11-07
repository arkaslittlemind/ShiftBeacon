# Visual redesign "Pourville" - spec pack

The design reference and buildable specs for replacing the cooled-down
neobrutalist system with the **Pourville** system: warm paper, ink buttons,
roman Newsreader headlines, an impressionist ocean blue, and painterly coastal
imagery, following the layout language of [Leedlime](https://leedlime.com/).

This folder lives in `docs/` on purpose. Both `prototypes/` (commit `b5cf2a5`)
and `blueprint/` are gitignored, so the locked tokens, reference screenshots,
and specs live here, where they survive a clean checkout and render on GitHub.
When `/feature` runs for a 21x item, its Design reference section links here.

**Status:** approved 2026-11-08 and added to `blueprint/build-plan.md` as
feature 21. Each sub-feature is specced with `/feature 21x`, which copies the
matching file from `specs/` into `blueprint/context/current-feature.md`, and
built with `/implement`.

## What is in this folder

| Path | What it is |
|---|---|
| [tokens/theme.css](tokens/theme.css) | The locked design tokens. Source of truth for colour, type, radius, shadow, spacing, and motion |
| [tokens/kit.css](tokens/kit.css) | Reference primitives (buttons, cards, badges, table, sidebar) built only from the tokens |
| [screens/](screens/) | Screenshots of the approved v4 prototypes, desktop and phone |
| [motion-and-polish.md](motion-and-polish.md) | The interaction and motion rules every spec builds against |
| [image-prompts.md](image-prompts.md) | ChatGPT image prompts for the app's own painterly imagery |
| [specs/](specs/) | One spec per sub-feature, in build order |

## Design reference

| Screen | Reference |
|---|---|
| Landing page | [landing-desktop.jpg](screens/landing-desktop.jpg), [landing-mobile.jpg](screens/landing-mobile.jpg) |
| Manager dashboard | [manager-dashboard.png](screens/manager-dashboard.png) |
| Staff detail | [manager-staff-detail.png](screens/manager-staff-detail.png) |
| Workplace settings | [manager-workplace.png](screens/manager-workplace.png) |
| Worker home | [inside](screens/worker-home-inside.png), [outside](screens/worker-home-outside.png), [on shift](screens/worker-home-active.png), [phone](screens/worker-home-mobile.png) |

When a prototype is open locally (`prototypes/*.html`), prefer it over the
screenshot: it carries the exact tokens.

## The system in one table

| Token group | v1 (shipping today) | Pourville |
|---|---|---|
| Page background | Mint `#EAF3F0` | Warm paper `#F8F6F1` |
| Text | Slate `#16262B` | Ink `#16212B` (muted `#47525D`, faint `#5F6872`) |
| Primary button | Sea Green fill, 3px ink border, offset shadow | Ink fill, no border, soft shadow, 10px radius (14px large) |
| Accent | Sea Green `#2E8B57` | Pourville blue `#1D6496`: links, focus, active, the Clock In action, charts |
| Borders | 3px ink | 1px warm hairline `#E6E1D6` |
| Shadows | Hard offset `5px 5px 0` | Soft, diffuse, warm-tinted |
| Display type | Space Grotesk | Newsreader (roman; italic not used for headlines) |
| UI type | Inter | Inter (unchanged) |
| Data type | `ui-monospace` | JetBrains Mono, tabular figures |
| Icons | lucide-react | Pikaicons (see `AGENTS.md`) |
| Imagery | None | Painterly coastal scenes, with UI cards floating on frosted glass |

Every text token clears WCAG AA 4.5:1 on every surface token. The ratios are
recorded in `tokens/theme.css`.

## Build-plan entry

Added after item 20 in `blueprint/build-plan.md`:

```markdown
- [ ] 21. **Visual redesign (Pourville)** - replace the cooled-down neobrutalist system with the Pourville system (warm paper, ink buttons, Newsreader display type, Pourville blue accent, painterly coastal imagery, Leedlime-style marketing layout) across every screen, migrate icons to Pikaicons, and bake the motion and polish rules into the primitives; behaviour, data, routes, and copy stay as they are unless a spec says otherwise
  - [ ] 21a. **Tokens + typography foundation** - port `tokens/theme.css` into `app/globals.css`, swap fonts to Newsreader + Inter + JetBrains Mono, add motion tokens and the refined reduced-motion rule, update the brand, coding-standards, and overview docs that describe the old system
  - [ ] 21b. **Pikaicons migration** - replace every `lucide-react` icon with its Pikaicons equivalent and remove the dependency
  - [ ] 21c. **UI primitives** - restyle `components/ui/*` (button, card, badge, input, textarea, table, dropdown menu, sheet) to the new system, with press feedback, origin-aware menus, and the drawer curve
  - [ ] 21d. **App shell** - manager sidebar and topbar, worker top nav, page header, user menu, and mobile sheet in the Leedlime app style
  - [ ] 21e. **Worker screens** - worker home (perimeter status, clock in/out, active shift, history) and worker profile
  - [ ] 21f. **Manager dashboard** - welcome banner with painting, stat tiles, staff table, charts, handover digest card, and ask card
  - [ ] 21g. **Manager secondary screens** - staff detail, workplace settings, manager profile, plus shared empty, forbidden, error, loading, not-found, and offline states
  - [ ] 21h. **Marketing landing rebuild** - the Leedlime-structured landing page using the public-domain paintings as interim art
  - [ ] 21i. **Commissioned imagery + share image** - swap in the generated images from `image-prompts.md`, optimize them, refresh the Open Graph image and the README screenshots
  - [ ] 21j. **Motion and polish QA** - apply the remaining items in `motion-and-polish.md`, run the contrast and reduced-motion checks, and capture final evidence

- [ ] 22. **Workplace map preview** - show the workplace location and its clock-in radius on a map in workplace settings, so a manager can see the geofence they are configuring; needs a map tiles provider decision (and its privacy and cost terms) before it is specced
```

Order rationale: tokens first, because every later step builds on them. Icons
second, because they are mechanical and touch the same files the restyles will
touch. Primitives before screens. The worker flow comes before the manager
screens because it is the headline attendance action. The landing page comes
last among the screens because it is the only surface needing new imagery.

## Plan and overview edits

The redesign changes the UI/UX direction, so `/feature`'s new-feature intake
also needs these edits, followed by `/overview` to regenerate
`blueprint/context/project-overview.md`:

- **`project-plan.md` section 6 (UI/UX)**: replace the "cooled-down
  neobrutalist" paragraph and its palette with the Pourville description (the
  table above), name Leedlime as the layout reference, and state that imagery is
  painterly coastal art with no text, logos, or identifiable people.
- **`blueprint/context/coding-standards.md`, Styling**: replace the Sea Green,
  chunky borders, and offset-shadow bullets with: Pourville tokens from
  `app/globals.css`, 1px hairlines and soft shadows, ink primary buttons, the
  Pourville blue accent reserved for links, focus, active, Clock In, and data,
  Pikaicons only, and "motion follows `motion-and-polish.md`".
- **`brand/README.md`**: records the recoloured mark (decision 1), in 21a.

## Decisions (settled 2026-11-08)

1. **Logo colours: recolour once.** `brand/README.md` fixed the mark's Sea
   Green against re-theming. The redesign makes a deliberate, one-time brand
   change instead: the shield in Pourville blue `#1D6496`, the outline and cross
   in ink `#16212B`. Shape and Space Grotesk wordmark unchanged. 21a (step 6)
   updates `brand/`, the mark component, and regenerates the icon set and
   favicon, and `brand/README.md` records the new fixed values.
2. **Dark bands: keep both.** The trusted-by strip and the AI section on the
   landing page stay ink, as on Leedlime. The rest of the site is light.
3. **Workplace map: a later feature.** 21g restyles the existing form only. A
   map preview of the workplace and its geofence is planned separately as
   build-plan item 22, after the redesign.

## Non-goals for the whole redesign

- No new routes, API changes, schema changes, or new product capabilities.
- No copy rewrite beyond what a layout needs (landing copy aside, which 21h
  replaces with the prototype copy).
- No dark mode. The product is light-only by decision.
- No change to the logo shape or to Auth0's hosted login page.
