import { redirect } from "next/navigation";

import { getServerSession } from "@/modules/auth/infrastructure/server-session";
import { currentYearMonth, parseYearMonth } from "@/modules/periods/domain/year-month";
import { DashboardContainer } from "@/modules/dashboard/ui/containers/dashboard-container";
import { MessageScreen } from "@/shared/ui/message-screen";

interface HomePageProps {
  searchParams: Promise<{ period?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getServerSession();
  if (session.status === "unauthenticated") {
    redirect("/login");
  }
  if (session.status === "unavailable") {
    return (
      <MessageScreen
        title="Wallet Track"
        message="The server can't be reached right now, so your session could not be checked."
        linkLabel="Try again"
      />
    );
  }
  const { period } = await searchParams;
  const currentPeriod = currentYearMonth(new Date());
  return (
    <DashboardContainer
      initialUser={session.user}
      initialPeriod={parseYearMonth(period) ?? currentPeriod}
      currentPeriod={currentPeriod}
    />
  );
}
