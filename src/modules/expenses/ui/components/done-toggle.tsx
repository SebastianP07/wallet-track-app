import { Check } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/shared/ui/button";

interface DoneToggleProps {
  name: string;
  // What being done is called on this kind of item.
  word: "paid" | "received";
  done: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function DoneToggle({ name, word, done, disabled, onToggle }: DoneToggleProps) {
  return (
    <Button
      variant={done ? "primary" : "outline"}
      className={cn("size-12 shrink-0 px-0", !done && "text-muted-foreground")}
      disabled={disabled}
      aria-pressed={done}
      aria-label={done ? `Undo ${word} on ${name}` : `Mark ${name} as ${word}`}
      onClick={onToggle}
    >
      <Check aria-hidden="true" className={cn("size-6", !done && "opacity-40")} />
    </Button>
  );
}
