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
import { monthLabel } from "@/modules/periods/domain/year-month";
import { PeriodStatusContainer } from "@/modules/periods/ui/containers/period-status-container";
import { TemplateSectionContainer } from "@/modules/periods/ui/containers/template-section-container";
import { PlatformSectionContainer } from "@/modules/platforms/ui/containers/platform-section-container";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";
import { TagFilter } from "@/modules/tags/ui/components/tag-filter";
import { TagSectionContainer } from "@/modules/tags/ui/containers/tag-section-container";
import { useI18n } from "@/shared/i18n/use-i18n";
import { clearOfflineData } from "@/shared/pwa/offline-data";
import { useOnlineStatus } from "@/shared/pwa/use-online-status";
import { Button } from "@/shared/ui/button";
import { FocusKeeper } from "@/shared/ui/focus-keeper";
import { DashboardHeader } from "../components/dashboard-header";
import { BottomNav } from "../components/bottom-nav";
import { CollapseAllAction } from "../components/collapse-all-action";
import { MonthSwitcher } from "../components/month-switcher";
import { ChartsContainer } from "./charts-container";
import { ExportContainer } from "./export-container";
import { OfflineBannerContainer } from "./offline-banner-container";
import { OverviewContainer } from "./overview-container";
import { RefreshContainer } from "./refresh-container";
import { SectionGridContainer } from "./section-grid-container";
import { useSectionNavigation } from "./use-section-navigation";

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
  const { locale, messages } = useI18n();
  // Every way a session ends here passes through this, so the saved Dashboard goes with it.
  const goToLogin = useCallback(() => {
    void clearOfflineData().finally(() => window.location.replace("/login"));
  }, []);
  const isOnline = useOnlineStatus();
  const navigation = useSectionNavigation();
  const { user, logOut, logOutEverywhere, isLoggingOut, logoutFailure } = useSession(
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
      accounts: <AccountSectionContainer onSessionEnded={goToLogin} />,
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
        {messages.dashboard.skipToMonth}
      </a>
      <OfflineBannerContainer isOffline={!isOnline} period={period} onSessionEnded={goToLogin} />
      {/* A disabled fieldset turns off every control inside at once, so a section added later cannot miss it. */}
      <fieldset disabled={!isOnline} className="contents">
        <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-6 px-4 pt-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-6 md:gap-8 md:pt-8">
          <DashboardHeader
            email={user.email}
            pending={isLoggingOut}
            failure={logoutFailure}
            onLogout={logOut}
            onLogoutAll={logOutEverywhere}
          />
          <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none md:gap-8">
            <div className="flex flex-col gap-3">
              <MonthSwitcher period={period} onChange={changePeriod} />
              {period === currentPeriod ? null : (
                <Button variant="link" className="w-fit px-0" onClick={() => changePeriod(currentPeriod)}>
                  {messages.dashboard.goToMonth(monthLabel(currentPeriod, locale))}
                </Button>
              )}
              <PeriodStatusContainer key={period} period={period} onSessionEnded={goToLogin} />
              {/* Wraps on a narrow phone instead of scrolling sideways. */}
              <div className="flex flex-wrap items-start gap-2">
                <ExportContainer key={`export-${period}`} period={period} onSessionEnded={goToLogin} />
                <CollapseAllAction anyOpen={navigation.openIds.size > 0} onCollapseAll={navigation.collapseAll} />
                <RefreshContainer />
              </div>
              <TagFilter tags={tags} selectedId={tagId} isLoading={isLoadingTags} onChange={setChosenTagId} />
            </div>
            <SectionGridContainer
              period={period}
              tagId={tagId}
              sections={sections}
              openIds={navigation.openIds}
              openedIds={navigation.openedIds}
              allOpen={!isOnline}
              onToggle={navigation.toggle}
            />
          </main>
        </div>
      </fieldset>
      {/* Outside the fieldset: offline, moving around the page still works. */}
      <BottomNav current={navigation.current} onNavigate={navigation.goTo} />
    </FocusKeeper>
  );
}
