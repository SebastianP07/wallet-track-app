import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("@/modules/auth/infrastructure/server-session", () => ({
  getServerSession: async () => ({
    status: "authenticated",
    user: { id: "00000000-0000-0000-0000-000000000000", email: "owner@example.com", mfaEnabled: true },
  }),
}));

describe("HomePage", () => {
  it("shows the application name as the main heading", async () => {
    const page = await HomePage({ searchParams: Promise.resolve({}) });

    render(<QueryClientProvider client={new QueryClient()}>{page}</QueryClientProvider>);

    expect(screen.getByRole("heading", { level: 1, name: "Wallet Track" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
