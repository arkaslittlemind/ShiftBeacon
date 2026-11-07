# Image prompts

Prompts for ChatGPT image generation, one per image slot in the redesign. They
replace the interim public-domain Monet paintings with scenes from
ShiftBeacon's own world: a care home by the sea, staff arriving for a shift, a
handover at dawn. Spec 21i swaps them in.

## How to use these

1. **Start a fresh chat and generate the hero first.** It sets the look for the
   whole set.
2. **Paste the style block below, then the slot prompt**, as one message.
3. For every later image, add one line at the start: *"Match the painting
   style, palette, and brushwork of the first image in this chat exactly."*
   This keeps the set consistent.
4. **Aspect ratios.** ChatGPT produces square, portrait (2:3), or landscape
   (3:2) images. For the wide slots, generate 3:2 landscape and crop. Each
   prompt says where the subject must sit so the crop works.
5. **Review every image** against the checklist at the end before it goes in
   the repo. Regenerate rather than fix.

## Style block (paste with every prompt)

```text
An original impressionist oil painting, plein-air style, with loose broken
brushwork and visible canvas texture, in the spirit of late-19th-century French
coastal painters. Soft early-morning light. Calm, unhurried, reassuring mood.
Palette: clear sea blues (deep ocean #1D6496, mid blue #6C9EC6, pale blue
#C3D7E7), warm cream and paper whites (#F8F6F1), muted sage and seafoam greens,
pale sand, a touch of warm peach in the sky near the horizon. Low contrast, airy
and luminous, never dramatic or stormy.
People, when present, are small, seen from a distance or from behind, painted
in a few strokes, with no facial detail. Care staff wear plain soft-blue or
white tunics with no logos.
Strictly no text, no letters, no signage, no logos, no watermarks, no frames, no
user-interface elements, no phones with visible screens, no hospital equipment,
no medical procedures.
```

## Slots

| # | File | Used in | Size to export |
|---|---|---|---|
| 1 | `marketing/hero.jpg` | Landing hero, right half | 1600 x 2000 (4:5) |
| 2 | `marketing/platform-band.jpg` | Landing band behind the dashboard preview | 2400 x 1030 (21:9) |
| 3 | `marketing/how-perimeter.jpg` | How it works, card 1 | 1200 x 800 (3:2) |
| 4 | `marketing/how-team.jpg` | How it works, card 2 | 1200 x 800 (3:2) |
| 5 | `marketing/how-arrival.jpg` | How it works, card 3 | 1200 x 800 (3:2) |
| 6 | `marketing/why-verified.jpg` | Why card 1 | 1400 x 1050 (4:3) |
| 7 | `marketing/why-live.jpg` | Why card 2 | 1400 x 1050 (4:3) |
| 8 | `marketing/footer-strip.jpg` | Footer strip | 2400 x 600 (4:1) |
| 9 | `app/dashboard-banner.jpg` | Manager dashboard welcome banner, right side | 1800 x 600 (3:1) |
| 10 | `og/share-background.jpg` | Open Graph image background | 1200 x 630 |
| 11 | `app/offline.jpg` (optional) | Offline page | 800 x 800 (1:1) |
| 12 | `app/empty-quiet.jpg` (optional) | Empty states ("nobody on shift yet") | 800 x 800 (1:1) |

All paths are under `public/images/`.

### 1. Hero - arrival at the care home by the sea

Portrait 2:3, crop to 4:5.

```text
A low, welcoming two-storey care home with pale cream walls and a soft
blue-grey roof sits on a gentle green headland above a calm, shining sea at low
tide. A gravel path with low lavender and grass edges leads up to its open front
door. One small care worker in a soft-blue tunic, seen from behind, walks up the
path carrying a bag, arriving for the morning shift. Early morning: a pale sky
warming to peach at the horizon, the sea glittering in long horizontal strokes.
Composition: the care home and the walking figure sit in the right half and the
middle band of the frame. Keep the upper-left third (sky) and the lower-right
quarter (path and grass) calm and low-detail, because interface cards will float
over those areas.
```

### 2. Platform band - the headland panorama

Landscape 3:2, crop to 21:9 keeping the top two thirds.

```text
A wide panoramic view along a calm coastline in the morning: a pale sky with soft
cumulus clouds fills the upper half, a quiet sea below it, and on a grassy
headland to the right the same small cream care home with its garden. Two tiny
figures walk the cliff path in the distance. Composition: the whole lower half of
the frame should be gentle grass and sea with no strong detail, because a large
dashboard screenshot will cover it. The interest sits in the sky and along the
far horizon line.
```

### 3. How it works - set your perimeter

Landscape 3:2.

```text
A gentle bird's-eye view, as if from a low hill, of the care home's grounds: the
cream building, a looping gravel path, a garden with benches, a low hedge that
traces a soft rounded boundary around the grounds, and the sea beyond. No people.
Composition: the building at the centre, the hedge boundary clearly readable as a
rough circle around it. The centre third will be partly covered by a small card,
so the boundary and the sea at the edges must carry the image.
```

### 4. How it works - invite your team

Landscape 3:2.

```text
A bright staff room in the care home with a large window open onto the sea.
Three or four care workers in soft-blue and white tunics, painted loosely and
seen from the side or from behind, gather around a wooden table with mugs,
chatting at the start of a shift. Morning light floods across the table. No
faces in detail, no screens, no paperwork with writing. Composition: people in
the lower half, the bright window and sea in the upper half.
```

### 5. How it works - clock in on arrival

Landscape 3:2.

```text
The care home's front entrance in early morning light: a wide open wooden door,
a climbing rose on the wall, a bench, and a care worker in a soft-blue tunic
stepping through the doorway, seen from behind, a small bag on the shoulder.
Through a gap between the trees the sea is visible. Calm and welcoming.
Composition: the doorway slightly left of centre; keep the centre of the image
low in detail because a small card will sit on it.
```

### 6. Why - verified on site

Landscape 3:2, crop to 4:3.

```text
A quiet garden gate in a low stone wall at the edge of the care home grounds,
with the cream building beyond it and the calm sea on the horizon. The gate
stands open. A gravel path runs from the gate toward the building. Morning light,
long soft shadows. No people. Composition: the gate, wall, and horizon all sit in
the top fifth and along the left edge of the frame. The rest of the image (the
lower-right four fifths) must be soft, even grass and path texture, because a
large interface panel will cover it.
```

### 7. Why - live, not end of shift

Landscape 3:2, crop to 4:3.

```text
A long, sunlit corridor inside the care home, with tall windows on one side
showing the sea, warm wooden floor, and soft cream walls. One care worker in a
soft-blue tunic walks away from the viewer far down the corridor. Calm morning
light falls in bright rectangles on the floor. Composition: the windows and sea
run along the top fifth and the left edge. The lower-right four fifths must be a
calm, low-detail area of floor and wall, because a large interface panel will
cover it.
```

### 8. Footer strip - the shoreline

Landscape 3:2, crop to 4:1 keeping the bottom third.

```text
A low, wide view of a sandy shoreline at the edge of the sea in soft morning
light: wet sand reflecting the sky, gentle surf lines, sea grass in the
foreground, and, very small on a distant headland, the cream care home. No
people. Composition: all interest in the bottom third of the frame; the top two
thirds are pale, even sky, because the image fades into the page from the top.
```

### 9. Dashboard banner - morning over the garden

Landscape 3:2, crop to 3:1 keeping the middle band.

```text
The care home garden on a clear morning: a wooden bench under a small tree, a
flower border of lavender and white roses, the low garden wall, and the calm sea
and pale sky beyond. A single small care worker in a soft-blue tunic sits on the
bench with a mug, seen from behind. Composition: bench, tree, and figure in the
right third of the frame; the left half must be soft, open sky and lawn, because
it fades into a white card.
```

### 10. Share image background

Landscape 3:2, crop to 1200 x 630.

```text
The calm sea at low tide below pale headland cliffs, a cream care home small on
the clifftop, pale morning sky. No people. Composition: the left 55 percent must
be quiet sea and sky with no strong detail, because a paper panel with the logo
and a headline will cover it. The headland and care home sit in the right third.
```

### 11. Offline page (optional)

Square 1:1.

```text
An empty wooden bench on a grassy clifftop facing a calm, misty sea, a single
coffee mug resting on the bench. Soft, quiet morning light. No people.
Composition: the bench small and centred in the lower third, wide open sky
above.
```

### 12. Empty state (optional)

Square 1:1.

```text
A small rowing boat pulled up on pale sand at low tide, oars resting inside it,
the calm sea and a soft sky behind. No people. Quiet, patient, unhurried.
Composition: the boat small in the lower centre, plenty of open space around it.
```

## Review checklist

Reject and regenerate if any answer is no:

- [ ] No text, letters, numbers, signage, logos, or watermark anywhere (zoom in on
      doors, walls, and clothing)
- [ ] No identifiable faces; people are small or seen from behind
- [ ] No medical equipment, procedures, or residents in distress
- [ ] Palette matches the set: sea blues, cream, sage, sand, never saturated or
      dark
- [ ] The areas marked "calm" in the prompt are low-detail where cards will sit
- [ ] Brushwork matches the hero; the set looks like one painter's work
- [ ] The care home looks like the same building across images 1, 2, 3, 6, 8, 9

## Rights and disclosure

Generated images become ShiftBeacon's own art for the site. Do not prompt with
the name of a living artist. Keep the original generations and the prompts with
the design files, outside the repo, in case an image needs regenerating to
match.
