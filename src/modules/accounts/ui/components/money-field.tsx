import type { ComponentProps } from "react";

import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface MoneyFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  onFlipSign: () => void;
}

// A decimal keypad shows digits and a separator, but iOS gives it no minus key, so the sign has
// its own button. A typed minus also works wherever the keyboard has one.
export function MoneyField({ onFlipSign, ...fieldProps }: MoneyFieldProps) {
  return (
    <Field
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className="font-mono"
      onFocus={(event) => event.target.select()}
      trailing={
        <Button variant="outline" className="shrink-0 px-3 font-mono" onClick={onFlipSign}>
          <span aria-hidden="true">+/−</span>
          <span className="sr-only">Switch between positive and negative</span>
        </Button>
      }
      {...fieldProps}
    />
  );
}
