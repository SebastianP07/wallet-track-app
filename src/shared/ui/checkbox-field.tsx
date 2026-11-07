import { useId, type ComponentProps } from "react";

interface CheckboxFieldProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
  hint?: string;
}

export function CheckboxField({ label, hint, ...inputProps }: CheckboxFieldProps) {
  const hintId = useId();
  return (
    <div className="flex flex-col gap-1">
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          className="size-5 shrink-0 accent-primary"
          aria-describedby={hint ? hintId : undefined}
          {...inputProps}
        />
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
