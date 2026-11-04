import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

interface DashboardHeaderProps {
  email: string;
  pending: boolean;
  failure: string | null;
  onLogout: () => void;
  onLogoutAll: () => void;
}

export function DashboardHeader({
  email,
  pending,
  failure,
  onLogout,
  onLogoutAll,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex min-w-0 flex-col">
          <h1 className="font-heading text-lg leading-tight font-bold">
            Wallet <span className="text-signal">Track</span>
          </h1>
          <p className="truncate font-mono text-xs text-muted-foreground">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={pending} onClick={onLogout}>
            Log out
          </Button>
          <Button variant="link" className="px-2" disabled={pending} onClick={onLogoutAll}>
            Log out everywhere
          </Button>
        </div>
      </div>
      <FormAlert message={failure} />
    </header>
  );
}
