import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "cn";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function Field({ label, hint, error, className, ...inputProps }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "min-h-12 w-full rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring aria-invalid:border-destructive",
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
