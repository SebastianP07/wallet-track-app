"use client";

import { useAccountSection } from "../../application/use-account-section";
import type { AccountGroup } from "../../domain/account-groups";
import { httpAccountsRepository } from "../../infrastructure/http-accounts-repository";
import { AccountSection } from "../components/account-section";

interface AccountSectionContainerProps {
  group: AccountGroup;
  onSessionEnded: () => void;
}

export function AccountSectionContainer({ group, onSessionEnded }: AccountSectionContainerProps) {
  const section = useAccountSection(httpAccountsRepository, group, onSessionEnded);
  return <AccountSection group={group} {...section} />;
}
