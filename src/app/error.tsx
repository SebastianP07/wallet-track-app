"use client";

import { MessageScreen } from "@/shared/ui/message-screen";

// Replaces Next.js's default error page, whose inline styles the CSP blocks.
export default function ErrorPage() {
  return (
    <MessageScreen
      title="Wallet Track"
      message="Something went wrong on this page."
      linkLabel="Back to the dashboard"
    />
  );
}
