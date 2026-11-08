import type { ReactNode } from "react";

import type { LoginFailure } from "../../application/use-login-flow";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

interface PasskeyStepProps {
  failure: LoginFailure | null;
  pending: boolean;
  onStart: () => void;
  children: ReactNode;
}

export function PasskeyStep({ failure, pending, onStart, children }: PasskeyStepProps) {
  const t = useMessages().auth;
  return (
    <div className="flex flex-col gap-5">
      <FormAlert message={failure?.message} />
      <Button autoFocus disabled={pending} onClick={onStart}>
        {pending ? t.waitingForPasskey : t.continueWithPasskey}
      </Button>
      <div className="flex flex-wrap items-center gap-x-5">{children}</div>
    </div>
  );
}
