"use client";

import { useCallback, useMemo, useState } from "react";

import { AccountSectionContainer } from "@/modules/accounts/ui/containers/account-section-container";
import { useSession } from "@/modules/auth/application/use-session";
import type { User } from "@/modules/auth/domain/types";
import { httpAuthRepository } from "@/modules/auth/infrastructure/http-auth-repository";
import { SecuritySectionContainer } from "@/modules/auth/ui/containers/security-section-container";
import { CardChargeSectionContainer } from "@/modules/cards/ui/containers/card-charge-section-container";
import { ExpenseSectionContainer } from "@/modules/expenses/ui/containers/expense-section-container";
import { IncomeSectionContainer } from "@/modules/income/ui/containers/income-section-container";
import { OverdueSectionContainer } from "@/modules/overdue/ui/containers/overdue-section-container";
import { monthName, yearOf } from "@/modules/periods/domain/year-month";
import { PeriodStatusContainer } from "@/modules/periods/ui/containers/period-status-container";
import { TemplateSectionContainer } from "@/modules/periods/ui/containers/template-section-container";
import { PlatformSectionContainer } from "@/modules/platforms/ui/containers/platform-section-container";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";
import { TagFilter } from "@/modules/tags/ui/components/tag-filter";
import { TagSectionContainer } from "@/modules/tags/ui/containers/tag-section-container";
import { clearOfflineData } from "@/shared/pwa/offline-data";
import { useOnlineStatus } from "@/shared/pwa/use-online-status";
import { Button } from "@/shared/ui/button";
import { FocusKeeper } from "@/shared/ui/focus-keeper";
import { DashboardHeader } from "../components/dashboard-header";
import { MonthSwitcher } from "../components/month-switcher";
import { SectionGrid } from "../components/section-grid";
import { ChartsContainer } from "./charts-container";
import { ExportContainer } from "./export-container";
import { OfflineBannerContainer } from "./offline-banner-container";
import { OverviewContainer } from "./overview-container";

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
  // Every way a session ends here passes through this, so the saved Dashboard goes with it.
  const goToLogin = useCallback(() => {
    void clearOfflineData().finally(() => window.location.replace("/login"));
  }, []);
  const isOnline = useOnlineStatus();
  const { user, logOut, isLoggingOut, logoutFailure } = useSession(
    httpAuthRepository,
    initialUser,
    goToLogin,
  );

  const { tags, isLoading: isLoadingTags } = useTagList(httpTagsRepository);
  const [chosenTagId, setChosenTagId] = useState<string | null>(null);
  // A tag deleted while chosen simply stops filtering.
  const tagId = tags.some((tag) => tag.id === chosenTagId) ? chosenTagId : null;

  const changePeriod = (next: string) => {
    setPeriod(next);
    window.history.replaceState(null, "", `/?period=${next}`);
  };

  // Stable elements, so that the session and the tags answering here do not render every section again.
  const sections = useMemo(
    () => ({
      kpis: <OverviewContainer period={period} onSessionEnded={goToLogin} />,
      charts: <ChartsContainer key={period} period={period} onSessionEnded={goToLogin} />,
      "fixed-expenses": (
        <ExpenseSectionContainer
          key={period}
          period={period}
          kind="fixed"
          tagId={tagId}
          onSessionEnded={goToLogin}
        />
      ),
      "occasional-expenses": (
        <ExpenseSectionContainer
          key={period}
          period={period}
          kind="occasional"
          tagId={tagId}
          onSessionEnded={goToLogin}
        />
      ),
      income: (
        <IncomeSectionContainer key={period} period={period} tagId={tagId} onSessionEnded={goToLogin} />
      ),
      "card-charges": (
        <CardChargeSectionContainer key={period} period={period} tagId={tagId} onSessionEnded={goToLogin} />
      ),
      platforms: <PlatformSectionContainer key={period} period={period} onSessionEnded={goToLogin} />,
      overdue: <OverdueSectionContainer key={period} period={period} tagId={tagId} onSessionEnded={goToLogin} />,
      accounts: <AccountSectionContainer group="spendable" onSessionEnded={goToLogin} />,
      savings: <AccountSectionContainer group="savings" onSessionEnded={goToLogin} />,
      templates: <TemplateSectionContainer onSessionEnded={goToLogin} />,
      tags: <TagSectionContainer onSessionEnded={goToLogin} />,
      security: <SecuritySectionContainer onSessionEnded={goToLogin} />,
    }),
    [period, tagId, goToLogin],
  );

  return (
    <FocusKeeper>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-30 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-3 focus-visible:font-semibold focus-visible:text-primary-foreground"
      >
        Skip to the month
      </a>
      <OfflineBannerContainer isOffline={!isOnline} period={period} onSessionEnded={goToLogin} />
      {/* A disabled fieldset turns off every control inside at once, so a section added later cannot miss it. */}
      <fieldset disabled={!isOnline} className="contents">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 md:gap-8 md:py-8">
          <DashboardHeader
            email={user.email}
            pending={isLoggingOut}
            failure={logoutFailure}
            onLogout={() => logOut("this-device")}
            onLogoutAll={() => logOut("all-devices")}
          />
          <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none md:gap-8">
            <div className="flex flex-col gap-3">
              <MonthSwitcher period={period} onChange={changePeriod} />
              {period === currentPeriod ? null : (
                <Button variant="link" className="w-fit px-0" onClick={() => changePeriod(currentPeriod)}>
                  Go to {monthName(currentPeriod)} {yearOf(currentPeriod)}
                </Button>
              )}
              <PeriodStatusContainer key={period} period={period} onSessionEnded={goToLogin} />
              <ExportContainer key={`export-${period}`} period={period} onSessionEnded={goToLogin} />
              <TagFilter tags={tags} selectedId={tagId} isLoading={isLoadingTags} onChange={setChosenTagId} />
            </div>
            <SectionGrid sections={sections} />
          </main>
        </div>
      </fieldset>
    </FocusKeeper>
  );
}
