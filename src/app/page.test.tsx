import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("shows the application name as the main heading", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Wallet Track" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
