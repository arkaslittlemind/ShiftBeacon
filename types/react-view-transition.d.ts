// React's <ViewTransition> (used for the app's route crossfade, see
// components/shell/route-transition.tsx) ships in the React build Next.js
// vendors for the App Router, but isn't in @types/react yet. This augments
// the module with just the shape this app uses.
import type { ReactNode } from "react";

declare module "react" {
  type ViewTransitionTiming = "none" | "auto" | (string & {}) | Record<string, string>;

  interface ViewTransitionProps {
    children?: ReactNode;
    name?: string;
    default?: ViewTransitionTiming;
    enter?: ViewTransitionTiming;
    exit?: ViewTransitionTiming;
    share?: ViewTransitionTiming;
    update?: ViewTransitionTiming;
  }

  export const ViewTransition: (props: ViewTransitionProps) => ReactNode;
}
