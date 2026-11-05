import { useId, type ComponentProps } from "react";

interface SelectFieldProps extends ComponentProps<"select"> {
  label: string;
  options: readonly { value: string; label: string }[];
  error?: string;
}

export function SelectField({ label, options, error, ...selectProps }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="min-h-12 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
