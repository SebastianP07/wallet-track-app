import type { Messages } from "./messages";
import type { ValidationMessages } from "./messages/validation";

export type ValidationKey = keyof ValidationMessages;

// What a schema puts in an issue: a key, worded only when a field shows it.
export function issue(key: ValidationKey): ValidationKey {
  return key;
}

function isValidationKey(messages: Messages, value: string): value is ValidationKey {
  return Object.hasOwn(messages.validation, value);
}

export function fieldError(messages: Messages, error: string | undefined): string | undefined {
  if (!error) {
    return undefined;
  }
  return isValidationKey(messages, error) ? messages.validation[error] : error;
}
