"use client";

import { resetBrowserAnalytics } from "@/lib/observability/analytics-browser";

// Every sign-out goes through here. Care workers share devices, so a logout
// route that skipped the reset would leave the previous worker's distinct_id
// attached to whoever signs in next.
export function LogoutLink({
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "href">) {
  return (
    <a
      href="/auth/logout"
      {...props}
      onClick={(event) => {
        resetBrowserAnalytics();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
