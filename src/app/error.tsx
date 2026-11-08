"use client";

import { useMessages } from "@/shared/i18n/use-i18n";
import { MessageScreen } from "@/shared/ui/message-screen";

// Replaces Next.js's default error page, whose inline styles the CSP blocks.
export default function ErrorPage() {
  const { common } = useMessages();
  return <MessageScreen title={common.appName} message={common.pageFailed} linkLabel={common.backToDashboard} />;
}
