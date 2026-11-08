import { render, screen } from "@testing-library/react";
import { MapPinIcon } from "@/components/icons";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the icon, title, and description", () => {
    render(
      <EmptyState
        icon={MapPinIcon}
        title="No shifts yet"
        description="Clocked shifts will show up here."
      />
    );

    expect(screen.getByRole("heading", { name: "No shifts yet" })).toBeInTheDocument();
    expect(screen.getByText("Clocked shifts will show up here.")).toBeInTheDocument();
  });
});
