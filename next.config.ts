import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import type { NextConfig } from "next";

import { OFFLINE_PAGE_CONTENT_SECURITY_POLICY } from "./src/shared/security/content-security-policy";

const OFFLINE_SHELL_FILES = ["sw.js", "offline.html", "offline.js", "offline.css"];

function offlineShellVersion(): string {
  const hash = createHash("sha256").update(OFFLINE_PAGE_CONTENT_SECURITY_POLICY);
  for (const file of OFFLINE_SHELL_FILES) {
    hash.update(readFileSync(new URL(`./public/${file}`, import.meta.url)));
  }
  return hash.digest("hex").slice(0, 16);
}

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_OFFLINE_SHELL_VERSION: offlineShellVersion() },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin" },
        ],
      },
      {
        source: "/offline.html",
        headers: [{ key: "Content-Security-Policy", value: OFFLINE_PAGE_CONTENT_SECURITY_POLICY }],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
