type CeremonyKind = "cancelled" | "already-registered" | "unsupported" | "failed";

const en = {
  passkeys: "PASSKEYS",
  activeSessions: "ACTIVE SESSIONS",
  passkeysLoadFailed: "The passkeys could not be loaded.",
  sessionsLoadFailed: "The sessions could not be loaded.",
  passkeysRefreshFailed: "Showing the last passkeys received; they could not be refreshed.",
  sessionsRefreshFailed: "Showing the last sessions received; they could not be refreshed.",
  noPasskeys: "No passkeys yet. Add one to sign in with your device's screen lock instead of typing a code.",
  cannotCreate: "This browser can't create passkeys. You can still rename or remove the ones listed here.",
  addPasskey: "Add passkey",
  passkeyName: "Passkey name",
  passkeyNameHint: "To tell it apart later, like “Work laptop”.",
  waiting: "Waiting…",
  removeBefore: "Remove ",
  removeAfter: " for good?",
  onlyPasskey: "It's your only passkey, so you'll sign in with your authenticator from now on.",
  otherPasskeys: "Your other passkeys keep working.",
  removing: "Removing…",
  remove: "Remove",
  added: (date: string) => `Added ${date}`,
  lastUsed: (date: string) => `Last used ${date}`,
  notUsed: "Not used yet",
  renamePasskey: (name: string) => `Rename passkey ${name}`,
  removePasskey: (name: string) => `Remove passkey ${name}`,
  confirmWith: "Confirm with",
  proofMethods: { totp: "Authenticator code", recovery_code: "Recovery code" },
  recoveryCodeHint: "Each recovery code works once, and this uses it up.",
  unknownDevice: "Unknown device",
  browserOn: (browser: string, system: string) => `${browser} on ${system}`,
  thisDevice: "This device",
  mfaPending: "Second factor pending",
  unknownAddress: "Unknown address",
  sessionTimes: (ip: string, seen: string, started: string) => `${ip} · Seen ${seen} · Started ${started}`,
  mfaPendingWarning: "Someone passed the password step here. If it wasn't you, end this and change your password.",
  endSession: "End session",
  endThisSession: "End the session on this device? You'll be signed out.",
  endOtherSession: (device: string) => `End the session on ${device}? It stops working at once.`,
  endSessionOn: (device: string, current: boolean) => `End session on ${device}${current ? ", this device" : ""}`,
  failures: {
    codeRejected: "That code was not accepted. A code works once, so wait for the next one or use another.",
    passkeyGone: "That passkey no longer exists.",
    registrationRejected:
      "The passkey was not accepted, or this took too long. Nothing was added. Enter a new code to try again.",
    alreadyRegistered: "That passkey is already registered.",
    nameRejected: "That name was not accepted.",
    sessionGone: "That session has already ended.",
    registrationCeremony: {
      cancelled:
        "The passkey prompt was cancelled or timed out, so nothing was added. That code is spent: enter a new one to try again.",
      "already-registered": "This device already holds a passkey for Wallet Track, so nothing was added. That code is spent.",
      unsupported: "This browser can't create passkeys, so nothing was added. That code is spent.",
      failed:
        "The passkey could not be created on this device, so nothing was added. That code is spent: enter a new one to try again.",
    } satisfies Record<CeremonyKind, string>,
  },
};

export type SecurityMessages = typeof en;

const es: SecurityMessages = {
  passkeys: "LLAVES DE ACCESO",
  activeSessions: "SESIONES ACTIVAS",
  passkeysLoadFailed: "No se pudieron cargar las llaves de acceso.",
  sessionsLoadFailed: "No se pudieron cargar las sesiones.",
  passkeysRefreshFailed: "Se muestran las últimas llaves de acceso recibidas; no se pudieron actualizar.",
  sessionsRefreshFailed: "Se muestran las últimas sesiones recibidas; no se pudieron actualizar.",
  noPasskeys:
    "Todavía no hay llaves de acceso. Agrega una para iniciar sesión con el bloqueo de pantalla de tu dispositivo en lugar de escribir un código.",
  cannotCreate:
    "Este navegador no puede crear llaves de acceso. Igual puedes cambiar el nombre o quitar las que aparecen aquí.",
  addPasskey: "Agregar llave de acceso",
  passkeyName: "Nombre de la llave de acceso",
  passkeyNameHint: "Para distinguirla después, como “Portátil del trabajo”.",
  waiting: "Esperando…",
  removeBefore: "¿Quitar ",
  removeAfter: " para siempre?",
  onlyPasskey: "Es tu única llave de acceso, así que de ahora en adelante iniciarás sesión con tu app de autenticación.",
  otherPasskeys: "Tus otras llaves de acceso siguen funcionando.",
  removing: "Quitando…",
  remove: "Quitar",
  added: (date: string) => `Agregada el ${date}`,
  lastUsed: (date: string) => `Último uso el ${date}`,
  notUsed: "Sin usar todavía",
  renamePasskey: (name: string) => `Cambiar nombre de la llave de acceso ${name}`,
  removePasskey: (name: string) => `Quitar la llave de acceso ${name}`,
  confirmWith: "Confirmar con",
  proofMethods: { totp: "Código de la app de autenticación", recovery_code: "Código de recuperación" },
  recoveryCodeHint: "Cada código de recuperación sirve una vez, y esto lo gasta.",
  unknownDevice: "Dispositivo desconocido",
  browserOn: (browser: string, system: string) => `${browser} en ${system}`,
  thisDevice: "Este dispositivo",
  mfaPending: "Segundo factor pendiente",
  unknownAddress: "Dirección desconocida",
  sessionTimes: (ip: string, seen: string, started: string) =>
    `${ip} · Visto el ${seen} · Iniciada el ${started}`,
  mfaPendingWarning:
    "Alguien pasó el paso de la contraseña aquí. Si no fuiste tú, termina esta sesión y cambia tu contraseña.",
  endSession: "Terminar sesión",
  endThisSession: "¿Terminar la sesión en este dispositivo? Se cerrará tu sesión.",
  endOtherSession: (device: string) => `¿Terminar la sesión en ${device}? Deja de funcionar de inmediato.`,
  endSessionOn: (device: string, current: boolean) =>
    `Terminar sesión en ${device}${current ? ", este dispositivo" : ""}`,
  failures: {
    codeRejected: "No se aceptó ese código. Un código sirve una vez, así que espera el siguiente o usa otro.",
    passkeyGone: "Esa llave de acceso ya no existe.",
    registrationRejected:
      "No se aceptó la llave de acceso, o esto tardó demasiado. No se agregó nada. Escribe un código nuevo para intentarlo de nuevo.",
    alreadyRegistered: "Esa llave de acceso ya está registrada.",
    nameRejected: "No se aceptó ese nombre.",
    sessionGone: "Esa sesión ya terminó.",
    registrationCeremony: {
      cancelled:
        "La solicitud de la llave de acceso se canceló o se agotó el tiempo, así que no se agregó nada. Ese código ya se gastó: escribe uno nuevo para intentarlo de nuevo.",
      "already-registered":
        "Este dispositivo ya tiene una llave de acceso para Wallet Track, así que no se agregó nada. Ese código ya se gastó.",
      unsupported: "Este navegador no puede crear llaves de acceso, así que no se agregó nada. Ese código ya se gastó.",
      failed:
        "No se pudo crear la llave de acceso en este dispositivo, así que no se agregó nada. Ese código ya se gastó: escribe uno nuevo para intentarlo de nuevo.",
    },
  },
};

export const security = { en, es };
