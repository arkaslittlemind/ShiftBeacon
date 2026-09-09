import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForbiddenState } from "./forbidden-state";

describe("ForbiddenState", () => {
  it("points a care worker back to the worker area", () => {
    render(<ForbiddenState role="CARE_WORKER" />);

    expect(screen.getByText(/signed in as a worker/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your worker area" })).toHaveAttribute(
      "href",
      "/worker/home"
    );
  });

  it("points a manager back to the manager area", () => {
    render(<ForbiddenState role="MANAGER" />);

    expect(screen.getByText(/signed in as a manager/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your manager area" })).toHaveAttribute(
      "href",
      "/manager/dashboard"
    );
  });
});
