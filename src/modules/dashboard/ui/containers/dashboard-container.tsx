"use client";

import { useCallback, useState } from "react";

import { AccountSectionContainer } from "@/modules/accounts/ui/containers/account-section-container";
import { useSession } from "@/modules/auth/application/use-session";
import type { User } from "@/modules/auth/domain/types";
import { httpAuthRepository } from "@/modules/auth/infrastructure/http-auth-repository";
import { monthName, yearOf } from "@/modules/periods/domain/year-month";
import { PeriodStatusContainer } from "@/modules/periods/ui/containers/period-status-container";
import { TemplateSectionContainer } from "@/modules/periods/ui/containers/template-section-container";
import { Button } from "@/shared/ui/button";
import { DashboardHeader } from "../components/dashboard-header";
import { MonthSwitcher } from "../components/month-switcher";
import { SectionGrid } from "../components/section-grid";

interface DashboardContainerProps {
  initialUser: User;
  initialPeriod: string;
  currentPeriod: string;
}

export function DashboardContainer({
  initialUser,
  initialPeriod,
  currentPeriod,
}: DashboardContainerProps) {
  const [period, setPeriod] = useState(initialPeriod);
  const goToLogin = useCallback(() => window.location.replace("/login"), []);
  const { user, logOut, isLoggingOut, logoutFailure } = useSession(
    httpAuthRepository,
    initialUser,
    goToLogin,
  );

  const changePeriod = (next: string) => {
    setPeriod(next);
    window.history.replaceState(null, "", `/?period=${next}`);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 md:gap-8 md:py-8">
      <DashboardHeader
        email={user.email}
        pending={isLoggingOut}
        failure={logoutFailure}
        onLogout={() => logOut("this-device")}
        onLogoutAll={() => logOut("all-devices")}
      />
      <div className="flex flex-col gap-3">
        <MonthSwitcher period={period} onChange={changePeriod} />
        {period === currentPeriod ? null : (
          <Button variant="link" className="w-fit px-0" onClick={() => changePeriod(currentPeriod)}>
            Go to {monthName(currentPeriod)} {yearOf(currentPeriod)}
          </Button>
        )}
        <PeriodStatusContainer key={period} period={period} onSessionEnded={goToLogin} />
      </div>
      <SectionGrid
        sections={{
          accounts: <AccountSectionContainer group="spendable" onSessionEnded={goToLogin} />,
          savings: <AccountSectionContainer group="savings" onSessionEnded={goToLogin} />,
          templates: <TemplateSectionContainer onSessionEnded={goToLogin} />,
        }}
      />
    </main>
  );
}
