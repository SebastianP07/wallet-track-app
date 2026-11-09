// Zod schemas carry these keys as their messages, so a form's errors follow a language switch at once.
const en = {
  nameRequired: "Enter a name.",
  nameTooLong: "Use at most 120 characters.",
  namePrintable: "Use only printable characters.",
  wholePesos: "Enter whole pesos, like 1.250.000 or -35.000. No decimals.",
  amountTooLarge: "That amount is too large.",
  itemAmount: "Enter whole pesos, zero or more, like 1.250.000. No decimals.",
  dueDate: "Choose a due date.",
  dateInvalid: "Enter a real date as DD/MM/YY, like 09/11/26.",
  day: "Enter a day between 1 and 31.",
  card: "Choose a card.",
  months: "Enter a whole number of months, from 1 to 120.",
  paymentDate: "Choose the date of the payment.",
  color: "Choose a color.",
  email: "Enter a valid email address.",
  password: "Enter your password.",
  passwordTooLong: "That password is too long.",
  totpCode: "Enter the 6-digit code from your authenticator.",
  recoveryCode: "Enter a recovery code.",
  recoveryCodeTooLong: "That recovery code is too long.",
  enrollmentSecret: "Enter the enrollment secret.",
  enrollmentSecretTooLong: "That enrollment secret is too long.",
};

export type ValidationMessages = typeof en;

const es: ValidationMessages = {
  nameRequired: "Escribe un nombre.",
  nameTooLong: "Usa máximo 120 caracteres.",
  namePrintable: "Usa solo caracteres imprimibles.",
  wholePesos: "Escribe pesos enteros, como 1.250.000 o -35.000. Sin decimales.",
  amountTooLarge: "Ese valor es demasiado grande.",
  itemAmount: "Escribe pesos enteros, cero o más, como 1.250.000. Sin decimales.",
  dueDate: "Elige una fecha de vencimiento.",
  dateInvalid: "Escribe una fecha real como DD/MM/AA, por ejemplo 09/11/26.",
  day: "Escribe un día entre 1 y 31.",
  card: "Elige una tarjeta.",
  months: "Escribe un número entero de meses, de 1 a 120.",
  paymentDate: "Elige la fecha del pago.",
  color: "Elige un color.",
  email: "Escribe un correo electrónico válido.",
  password: "Escribe tu contraseña.",
  passwordTooLong: "Esa contraseña es demasiado larga.",
  totpCode: "Escribe el código de 6 dígitos de tu app de autenticación.",
  recoveryCode: "Escribe un código de recuperación.",
  recoveryCodeTooLong: "Ese código de recuperación es demasiado largo.",
  enrollmentSecret: "Escribe el secreto de registro.",
  enrollmentSecretTooLong: "Ese secreto de registro es demasiado largo.",
};

export const validation = { en, es };
