import { isCalendarDate } from "@/shared/format/date-input";
import { issue, type ValidationKey } from "@/shared/i18n/validation-key";

// A DateField holds YYYY-MM-DD once its text reads as a real day, and the raw text otherwise. Text that
// is not a date (31/02/26, 09/11) gets the format message; an empty field or a real day outside the
// field's range keeps the field's own message.
export function dateIssue(value: string, fieldMessage: ValidationKey): ValidationKey {
  return value.trim() !== "" && !isCalendarDate(value) ? issue("dateInvalid") : fieldMessage;
}
