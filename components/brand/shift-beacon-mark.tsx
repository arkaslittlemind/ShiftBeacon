// Paths are inlined from brand/mark-full-colour.svg rather than imported, so a
// colourway is a prop instead of separate files per ground. brand/ stays the
// source of record: if the art is redrawn, both change together.
const SHIELD =
  "M13 15 Q13 10.5 17.4 9.6 L60 2.5 L102.6 9.6 Q107 10.5 107 15 L107 69 Q107 100 60 127 Q13 100 13 69 Z";
const PIN =
  "M60 27 C46.2 27 35 38.2 35 52 C35 70.5 60 100 60 100 C60 100 85 70.5 85 52 C85 38.2 73.8 27 60 27 Z M56.6 42 h6.8 v7.6 h7.6 v6.8 h-7.6 v7.6 h-6.8 v-7.6 h-7.6 v-6.8 h7.6 Z";

type Variant = "full-colour" | "on-ink";

// Hex rather than fill-primary/stroke-border, even though the tokens in
// app/globals.css hold these exact values today: a logo must not re-colour if
// the UI is ever re-themed. brand/README.md records the same rule.
//
// The on-ink stroke is heavier than the full-colour one; that is the export's
// own weighting for a dark ground, not a rounding slip.
const VARIANTS: Record<
  Variant,
  { shield: string; stroke?: string; strokeWidth?: number; pin: string }
> = {
  "full-colour": {
    shield: "#2e8b57",
    stroke: "#16262b",
    strokeWidth: 4,
    pin: "#ffffff",
  },
  "on-ink": {
    shield: "#2e8b57",
    stroke: "#eaf3f0",
    strokeWidth: 4.5,
    pin: "#16262b",
  },
};

export function ShiftBeaconMark({
  variant = "full-colour",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const colours = VARIANTS[variant];

  return (
    <svg
      viewBox="0 0 120 132"
      className={className}
      aria-hidden
    >
      <path
        d={SHIELD}
        fill={colours.shield}
        stroke={colours.stroke}
        strokeWidth={colours.strokeWidth}
        strokeLinejoin="round"
      />
      <path d={PIN} fill={colours.pin} fillRule="evenodd" />
    </svg>
  );
}
