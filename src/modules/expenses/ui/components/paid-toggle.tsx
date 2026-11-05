import { Check } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/shared/ui/button";

interface PaidToggleProps {
  name: string;
  paid: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function PaidToggle({ name, paid, disabled, onToggle }: PaidToggleProps) {
  return (
    <Button
      variant={paid ? "primary" : "outline"}
      className={cn("size-12 shrink-0 px-0", !paid && "text-muted-foreground")}
      disabled={disabled}
      aria-pressed={paid}
      aria-label={paid ? `Undo paid on ${name}` : `Mark ${name} as paid`}
      onClick={onToggle}
    >
      <Check aria-hidden="true" className={cn("size-6", !paid && "opacity-40")} />
    </Button>
  );
}
