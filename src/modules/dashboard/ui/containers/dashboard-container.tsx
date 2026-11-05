"use client";

import { useCallback, useState } from "react";

import { AccountSectionContainer } from "@/modules/accounts/ui/containers/account-section-container";
import { useSession } from "@/modules/auth/application/use-session";
import type { User } from "@/modules/auth/domain/types";
import { httpAuthRepository } from "@/modules/auth/infrastructure/http-auth-repository";
import { DashboardHeader } from "../components/dashboard-header";
import { MonthSwitcher } from "../components/month-switcher";
import { SectionGrid } from "../components/section-grid";

interface DashboardContainerProps {
  initialUser: User;
  initialPeriod: string;
}

export function DashboardContainer({ initialUser, initialPeriod }: DashboardContainerProps) {
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
      <MonthSwitcher period={period} onChange={changePeriod} />
      <SectionGrid
        sections={{
          accounts: <AccountSectionContainer group="spendable" onSessionEnded={goToLogin} />,
          savings: <AccountSectionContainer group="savings" onSessionEnded={goToLogin} />,
        }}
      />
    </main>
  );
}
