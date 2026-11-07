import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getServerSession } from "@/modules/auth/infrastructure/server-session";
import { LoginContainer } from "@/modules/auth/ui/containers/login-container";
import { OfflineDataPurge } from "@/shared/pwa/offline-data-purge";

export const metadata: Metadata = { title: "Sign in · Wallet Track" };

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
