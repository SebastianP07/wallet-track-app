import { DONE_WORDS_ES, type DoneWord } from "./expenses";

// What every write says once it lands or fails, and the questions asked before the ones with consequences.
const en = {
  dismiss: "Dismiss notice",
  actionFailed: "That could not be done. Try again.",
  offline: "You are offline. Connect again to confirm.",
  confirming: "Confirming…",
  added: (name: string) => `Added “${name}”.`,
  saved: (name: string) => `Saved the changes to “${name}”.`,
  deleted: (name: string) => `Deleted “${name}”.`,
  markedDone: (name: string, word: DoneWord) => `Marked “${name}” as ${word}.`,
  unmarkedDone: (name: string, word: DoneWord) => `“${name}” is no longer marked ${word}.`,
  orderSaved: "Saved the new order.",
  templateActivated: (name: string) => `Activated “${name}”.`,
  templateDeactivated: (name: string) => `Deactivated “${name}”.`,
  paymentRecorded: (name: string) => `Recorded the payment from “${name}”.`,
  paymentRemoved: (name: string) => `Removed the payment from “${name}”.`,
  memberAdded: (person: string, platform: string) => `“${person}” now shares “${platform}”.`,
  memberRemoved: (person: string, platform: string) => `“${person}” no longer shares “${platform}”.`,
  monthOpened: (month: string) => `Opened ${month}.`,
  monthClosed: (month: string) => `Closed ${month}.`,
  openingBalanceSaved: "Saved the start of the month.",
  openingBalanceCleared: "Cleared the start of the month.",
  sessionEnded: "Ended that session.",
  confirm: {
    markDone: {
      title: (name: string, word: DoneWord) => `Mark “${name}” as ${word}?`,
      text: "It stops counting as pending this month.",
      action: (word: DoneWord) => `Mark as ${word}`,
    },
    unmarkDone: {
      title: (name: string) => `Unmark “${name}”?`,
      text: (word: DoneWord) => `It stops counting as ${word} and goes back to what is still owed.`,
      action: "Unmark",
    },
    openMonth: {
      title: (month: string) => `Open ${month}?`,
    },
    activateTemplate: {
      title: (name: string) => `Activate “${name}”?`,
      text: "Every month you open from now on gets it. Months already open stay as they are.",
    },
    deactivateTemplate: {
      title: (name: string) => `Deactivate “${name}”?`,
      text: "Months you open from now on stop getting it. Months already open keep theirs.",
    },
    addMember: {
      title: (person: string, platform: string) => `Add “${person}” to “${platform}”?`,
      text: "The share each member pays is worked out again.",
      action: "Add",
    },
    removeMember: {
      title: (person: string, platform: string) => `Remove “${person}” from “${platform}”?`,
      text: "The share each member pays is worked out again.",
      action: "Remove",
    },
    logOutEverywhere: {
      title: "Log out on every device?",
      text: "Every session ends, this one included, and you will need to log in again.",
    },
  },
};

export type FeedbackMessages = typeof en;

const es: FeedbackMessages = {
  dismiss: "Cerrar aviso",
  actionFailed: "No se pudo completar la acción. Inténtalo de nuevo.",
  offline: "Sin conexión. Conéctate de nuevo para confirmar.",
  confirming: "Confirmando…",
  added: (name: string) => `Se agregó «${name}».`,
  saved: (name: string) => `Se guardaron los cambios de «${name}».`,
  deleted: (name: string) => `Se eliminó «${name}».`,
  markedDone: (name: string, word: DoneWord) => `Se marcó «${name}» como ${DONE_WORDS_ES[word]}.`,
  unmarkedDone: (name: string, word: DoneWord) => `«${name}» ya no figura como ${DONE_WORDS_ES[word]}.`,
  orderSaved: "Se guardó el nuevo orden.",
  templateActivated: (name: string) => `Se activó «${name}».`,
  templateDeactivated: (name: string) => `Se desactivó «${name}».`,
  paymentRecorded: (name: string) => `Se registró el pago de «${name}».`,
  paymentRemoved: (name: string) => `Se eliminó el pago de «${name}».`,
  memberAdded: (person: string, platform: string) => `«${person}» ahora comparte «${platform}».`,
  memberRemoved: (person: string, platform: string) => `«${person}» ya no comparte «${platform}».`,
  monthOpened: (month: string) => `Se abrió ${month}.`,
  monthClosed: (month: string) => `Se cerró ${month}.`,
  openingBalanceSaved: "Se guardó el inicio del mes.",
  openingBalanceCleared: "Se quitó el inicio del mes.",
  sessionEnded: "Se cerró esa sesión.",
  confirm: {
    markDone: {
      title: (name: string, word: DoneWord) => `¿Marcar «${name}» como ${DONE_WORDS_ES[word]}?`,
      text: "Deja de contar como pendiente en este mes.",
      action: (word: DoneWord) => `Marcar como ${DONE_WORDS_ES[word]}`,
    },
    unmarkDone: {
      title: (name: string) => `¿Desmarcar «${name}»?`,
      text: (word: DoneWord) => `Deja de contar como ${DONE_WORDS_ES[word]} y vuelve a lo pendiente.`,
      action: "Desmarcar",
    },
    openMonth: {
      title: (month: string) => `¿Abrir ${month}?`,
    },
    activateTemplate: {
      title: (name: string) => `¿Activar «${name}»?`,
      text: "Cada mes que abras desde ahora lo incluye. Los meses ya abiertos quedan como están.",
    },
    deactivateTemplate: {
      title: (name: string) => `¿Desactivar «${name}»?`,
      text: "Los meses que abras desde ahora dejan de incluirlo. Los meses ya abiertos conservan el suyo.",
    },
    addMember: {
      title: (person: string, platform: string) => `¿Agregar a «${person}» en «${platform}»?`,
      text: "Se vuelve a calcular la parte que paga cada integrante.",
      action: "Agregar",
    },
    removeMember: {
      title: (person: string, platform: string) => `¿Quitar a «${person}» de «${platform}»?`,
      text: "Se vuelve a calcular la parte que paga cada integrante.",
      action: "Quitar",
    },
    logOutEverywhere: {
      title: "¿Cerrar sesión en todos los dispositivos?",
      text: "Se cierran todas las sesiones, incluida esta, y tendrás que iniciar sesión de nuevo.",
    },
  },
};

export const feedback = { en, es };
