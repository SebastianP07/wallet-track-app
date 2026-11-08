import { getMessages } from "@/shared/i18n/server-locale";
import { MessageScreen } from "@/shared/ui/message-screen";

// Replaces Next.js's default 404, whose inline styles the CSP blocks.
export default async function NotFound() {
  const { common } = await getMessages();
  return <MessageScreen title={common.appName} message={common.notFound} linkLabel={common.goToDashboard} />;
}
