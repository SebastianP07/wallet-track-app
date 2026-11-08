import type { Ref } from "react";
import { Check } from "lucide-react";
import { cn } from "cn";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface DoneToggleProps {
  name: string;
  // What being done is called on this kind of item.
  word: "paid" | "received" | "charged";
  done: boolean;
  disabled: boolean;
  onToggle: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export function DoneToggle({ name, word, done, disabled, onToggle, ref }: DoneToggleProps) {
  const t = useMessages().expenses;
  return (
    <Button
      ref={ref}
      variant={done ? "primary" : "outline"}
      className={cn("size-12 shrink-0 px-0", !done && "text-muted-foreground")}
      disabled={disabled}
      aria-pressed={done}
      aria-label={t.markAs(name, word)}
      onClick={onToggle}
    >
      <Check aria-hidden="true" className={cn("size-6", !done && "opacity-40")} />
    </Button>
  );
}
