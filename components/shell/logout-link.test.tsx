import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutLink } from "./logout-link";

const resetBrowserAnalytics = vi.fn();

vi.mock("@/lib/observability/analytics-browser", () => ({
  resetBrowserAnalytics: () => resetBrowserAnalytics(),
}));

beforeEach(() => {
  resetBrowserAnalytics.mockReset();
});

describe("LogoutLink", () => {
  it("points at the Auth0 logout route", () => {
    render(<LogoutLink>Log out</LogoutLink>);

    expect(screen.getByRole("link", { name: "Log out" })).toHaveAttribute(
      "href",
      "/auth/logout"
    );
  });

  // A shared device must not carry the previous worker's identity into the
  // next person's session.
  it("clears the analytics identity before navigating", async () => {
    const user = userEvent.setup();
    render(<LogoutLink>Log out</LogoutLink>);

    await user.click(screen.getByRole("link", { name: "Log out" }));

    expect(resetBrowserAnalytics).toHaveBeenCalledTimes(1);
  });

  it("still runs a caller's own onClick", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<LogoutLink onClick={onClick}>Log out</LogoutLink>);

    await user.click(screen.getByRole("link", { name: "Log out" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
