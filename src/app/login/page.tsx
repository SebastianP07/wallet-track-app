import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "@/modules/auth/infrastructure/server-session";
import { LoginContainer } from "@/modules/auth/ui/containers/login-container";
import { getMessages } from "@/shared/i18n/server-locale";
import { OfflineDataPurge } from "@/shared/pwa/offline-data-purge";

export async function generateMetadata(): Promise<Metadata> {
  const { auth, common } = await getMessages();
  return { title: `${auth.pageTitle} · ${common.appName}` };
}

export default async function LoginPage() {
  const session = await getServerSession();
  if (session.status === "authenticated") {
    redirect("/");
  }
  return (
    <>
      {session.status === "unauthenticated" ? <OfflineDataPurge /> : null}
      <LoginContainer />
    </>
  );
}
