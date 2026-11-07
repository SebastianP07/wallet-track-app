"use client";

import { useAccountSection } from "../../application/use-account-section";
import { httpAccountsRepository } from "../../infrastructure/http-accounts-repository";
import { AccountSection } from "../components/account-section";

interface AccountSectionContainerProps {
  onSessionEnded: () => void;
}

export function AccountSectionContainer({ onSessionEnded }: AccountSectionContainerProps) {
  const section = useAccountSection(httpAccountsRepository, onSessionEnded);
  return <AccountSection {...section} />;
}
