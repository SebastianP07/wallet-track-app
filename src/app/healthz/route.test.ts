// @vitest-environment node
import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /healthz", () => {
  it("reports ok without allowing caches to store the answer", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
