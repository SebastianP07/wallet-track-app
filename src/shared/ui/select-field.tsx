import { useId, type ComponentProps } from "react";

interface SelectFieldProps extends ComponentProps<"select"> {
  label: string;
  options: readonly { value: string; label: string }[];
}

export function SelectField({ label, options, ...selectProps }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        className="min-h-12 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring"
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
