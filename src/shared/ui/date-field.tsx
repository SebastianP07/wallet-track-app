import { useRef, useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { useController, type Control, type FieldPathByValue, type FieldValues } from "react-hook-form";

import {
  dateFormValue,
  FIRST_TYPED_DATE,
  LAST_TYPED_DATE,
  maskDateInput,
  parseDateInput,
  toDateInput,
} from "@/shared/format/date-input";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface DateFieldProps<Values extends FieldValues, Name extends FieldPathByValue<Values, string>, Output> {
  control: Control<Values, unknown, Output>;
  name: Name;
  label: string;
  hint?: ReactNode;
  error?: string;
}

// Every date input in the app. The text field shows and accepts DD/MM/YY on a numeric keypad, while
// the form keeps YYYY-MM-DD (or the raw text, so the schema can say it is not a date). The calendar
// button opens the browser's own picker through a hidden date input, so phones keep their date wheel.
export function DateField<Values extends FieldValues, Name extends FieldPathByValue<Values, string>, Output>({
  control,
  name,
  label,
  hint,
  error,
}: DateFieldProps<Values, Name, Output>) {
  const { field } = useController({ control, name });
  const t = useMessages().common;
  const value: string = typeof field.value === "string" ? field.value : "";
  const [text, setText] = useState(() => toDateInput(value));
  const [shownValue, setShownValue] = useState(value);
  const textRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // The form value changed from outside the field (a reset), so the text follows it.
  if (value !== shownValue) {
    setShownValue(value);
    if (value !== dateFormValue(text)) {
      setText(toDateInput(value));
    }
  }

  function show(raw: string) {
    const masked = maskDateInput(raw);
    const formValue = dateFormValue(masked);
    setText(masked);
    setShownValue(formValue);
    field.onChange(formValue);
  }

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }
    picker.value = parseDateInput(text) ?? "";
    try {
      picker.showPicker();
    } catch {
      // No showPicker() (older browsers) or it was refused: typing the date is always possible.
      textRef.current?.focus();
    }
  }

  return (
    <Field
      label={label}
      hint={
        hint ? (
          <>
            {hint} {t.dateFormatHint}
          </>
        ) : (
          t.dateFormatHint
        )
      }
      error={error}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={t.datePlaceholder}
      className="font-mono"
      name={field.name}
      value={text}
      disabled={field.disabled}
      onChange={(event) => show(event.target.value)}
      onBlur={field.onBlur}
      ref={(element: HTMLInputElement | null) => {
        textRef.current = element;
        field.ref(element);
      }}
      trailing={
        <div className="relative shrink-0">
          <Button
            variant="outline"
            className="px-3"
            aria-label={t.openCalendar(label)}
            disabled={field.disabled}
            onClick={openPicker}
          >
            <CalendarDays aria-hidden="true" className="size-5" />
          </Button>
          {/* Only the button reaches this input: no tab stop, nothing for assistive tech, no pointer events.
              It sits under the button so the desktop picker opens next to it. */}
          <input
            ref={pickerRef}
            type="date"
            tabIndex={-1}
            aria-hidden="true"
            min={FIRST_TYPED_DATE}
            max={LAST_TYPED_DATE}
            className="pointer-events-none absolute inset-0 size-full opacity-0"
            onChange={(event) => show(toDateInput(event.target.value))}
          />
        </div>
      }
    />
  );
}
