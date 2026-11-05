"use client";

import { useActiveSessions } from "../../application/use-active-sessions";
import { usePasskeys } from "../../application/use-passkeys";
import { browserPasskeys } from "../../infrastructure/browser-passkeys";
import { httpSecurityRepository } from "../../infrastructure/http-security-repository";
import { SecuritySection } from "../components/security-section";

export function SecuritySectionContainer({ onSessionEnded }: { onSessionEnded: () => void }) {
  const passkeys = usePasskeys(httpSecurityRepository, browserPasskeys, onSessionEnded);
  const sessions = useActiveSessions(httpSecurityRepository, onSessionEnded);
  return <SecuritySection passkeys={passkeys} sessions={sessions} />;
}
