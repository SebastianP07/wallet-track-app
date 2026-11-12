import { useState } from "react";

import { LanguageSwitch } from "@/shared/i18n/language-switch";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FormAlert } from "@/shared/ui/form-alert";

interface DashboardHeaderProps {
  email: string;
  pending: boolean;
  failure: string | null;
  onLogout: () => void;
  // Asked first, then waited on: it ends every session, this one included.
  onLogoutAll: () => Promise<unknown>;
}

export function DashboardHeader({
  email,
  pending,
  failure,
  onLogout,
  onLogoutAll,
}: DashboardHeaderProps) {
  const { dashboard: t, feedback } = useMessages();
  const [isConfirmingLogoutAll, setIsConfirmingLogoutAll] = useState(false);
  return (
    <header className="flex flex-col gap-3">
      {/* Stacked on a phone whatever the language, so shorter labels cannot pull the buttons up beside the name. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:w-auto sm:flex-1">
          <div className="flex min-w-0 flex-col">
            <h1 className="font-heading text-lg leading-tight font-bold">
              Wallet <span className="text-signal">Track</span>
            </h1>
            <p className="truncate font-mono text-xs text-muted-foreground">{email}</p>
          </div>
          <LanguageSwitch />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="whitespace-nowrap" disabled={pending} onClick={onLogout}>
            {t.logOut}
          </Button>
          <Button
            variant="link"
            className="px-2 whitespace-nowrap"
            disabled={pending}
            onClick={() => setIsConfirmingLogoutAll(true)}
          >
            {t.logOutEverywhere}
          </Button>
          <ConfirmDialog
            open={isConfirmingLogoutAll}
            title={feedback.confirm.logOutEverywhere.title}
            description={feedback.confirm.logOutEverywhere.text}
            confirmLabel={t.logOutEverywhere}
            destructive
            onConfirm={onLogoutAll}
            onClose={() => setIsConfirmingLogoutAll(false)}
          />
        </div>
      </div>
      <FormAlert message={failure} />
    </header>
  );
}
