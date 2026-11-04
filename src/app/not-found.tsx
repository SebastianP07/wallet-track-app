import { MessageScreen } from "@/shared/ui/message-screen";

// Replaces Next.js's default 404, whose inline styles the CSP blocks.
export default function NotFound() {
  return (
    <MessageScreen
      title="Wallet Track"
      message="There is nothing at this address."
      linkLabel="Go to the dashboard"
    />
  );
}
