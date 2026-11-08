const en = {
  checking: "Checking this month…",
  statusLoadFailed: "The status of this month could not be loaded.",
  notOpened: "Not opened",
  closed: "Closed",
  open: "Open",
  notOpenedText: (month: string) =>
    `${month} has no period yet. Opening it copies your active recurring templates into it.`,
  opening: "Opening…",
  openMonth: "Open month",
  closedText: (month: string) =>
    `${month} is closed. Its unpaid expenses moved to the Overdue section of the next month that is not closed; income still to receive stays here as overdue.`,
  openText: (month: string) => `${month} is open.`,
  closing: "Closing…",
  closeMonth: "Close month",
  keepOpen: "Keep it open",
  closeConfirm: (month: string, monthOnly: string) =>
    `Close ${month}? Every unpaid fixed and occasional item, and everything still in its Overdue section, moves to the Overdue section of the next month that is not closed, where it counts toward to pay. Pending income becomes overdue and stays in ${monthOnly}. Card charges stay as they are. A closed month can't be reopened.`,
  templates: {
    kinds: { fixed: "Fixed expense", income: "Income", card_charge: "Card charge" },
    groups: { fixed: "Fixed expenses", income: "Income", card_charge: "Card charges" },
    kind: "Kind",
    dueDay: "Due day",
    dueDayHint: "1 to 31. In a shorter month it falls on the last day.",
    card: "Card",
    loadingCards: "Loading cards…",
    chooseCard: "Choose a card",
    noCardsBefore: "A card charge needs a card, and there are none yet. Add one in ",
    noCardsLink: "Card charges",
    noCardsAfter: ", and it will show up here without losing what you typed.",
    cardsLoadFailed: "The cards could not be loaded.",
    dueOnDay: (day: number | null) => `Due on day ${day}`,
    noCard: "No card",
    onCard: (name: string) => `On ${name}`,
    inactive: "Inactive",
    activate: "Activate",
    deactivate: "Deactivate",
    activateItem: (name: string) => `Activate ${name}`,
    deactivateItem: (name: string) => `Deactivate ${name}`,
    chooseCardToActivate: "Edit it and choose a card to activate it.",
    deleteBefore: "Delete ",
    deleteAfter: " for good? Months already opened keep their items; months opened from now on won't get it.",
    loadFailed: "The templates could not be loaded.",
    refreshFailed: "Showing the last templates received; they could not be refreshed.",
    empty: "No templates yet. Add what repeats every month.",
    noneYet: "None yet.",
    add: "Add template",
  },
  failures: {
    periodRejected: "That month can't be used. Months start at January 2000.",
    periodNotFound: "This month has not been opened. Reload the page to see it as it is now.",
    templateRejected: "That change was not accepted. Check the values; an active card charge must keep a card.",
    templateNotFound: "That template no longer exists.",
  },
};

export type PeriodsMessages = typeof en;

// A month name opens some sentences, and Spanish writes it in lower case inside one.
const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const es: PeriodsMessages = {
  checking: "Revisando este mes…",
  statusLoadFailed: "No se pudo cargar el estado de este mes.",
  notOpened: "Sin abrir",
  closed: "Cerrado",
  open: "Abierto",
  notOpenedText: (month: string) =>
    `${capitalized(month)} todavía no tiene periodo. Al abrirlo se copian en él tus plantillas recurrentes activas.`,
  opening: "Abriendo…",
  openMonth: "Abrir mes",
  closedText: (month: string) =>
    `${capitalized(month)} está cerrado. Sus gastos sin pagar pasaron a la sección Vencidos del siguiente mes que no esté cerrado; los ingresos por recibir se quedan aquí como vencidos.`,
  openText: (month: string) => `${capitalized(month)} está abierto.`,
  closing: "Cerrando…",
  closeMonth: "Cerrar mes",
  keepOpen: "Dejarlo abierto",
  closeConfirm: (month: string, monthOnly: string) =>
    `¿Cerrar ${month}? Todos los ítems fijos y ocasionales sin pagar, y todo lo que siga en su sección Vencidos, pasan a la sección Vencidos del siguiente mes que no esté cerrado, donde cuentan en por pagar. Los ingresos pendientes quedan vencidos y se quedan en ${monthOnly}. Los cargos a tarjeta quedan como están. Un mes cerrado no se puede volver a abrir.`,
  templates: {
    kinds: { fixed: "Gasto fijo", income: "Ingreso", card_charge: "Cargo a tarjeta" },
    groups: { fixed: "Gastos fijos", income: "Ingresos", card_charge: "Cargos a tarjeta" },
    kind: "Tipo",
    dueDay: "Día de vencimiento",
    dueDayHint: "De 1 a 31. En un mes más corto cae el último día.",
    card: "Tarjeta",
    loadingCards: "Cargando tarjetas…",
    chooseCard: "Elige una tarjeta",
    noCardsBefore: "Un cargo a tarjeta necesita una tarjeta, y todavía no hay ninguna. Agrega una en ",
    noCardsLink: "Cargos a tarjeta",
    noCardsAfter: " y aparecerá aquí sin perder lo que escribiste.",
    cardsLoadFailed: "No se pudieron cargar las tarjetas.",
    dueOnDay: (day: number | null) => `Vence el día ${day}`,
    noCard: "Sin tarjeta",
    onCard: (name: string) => `En ${name}`,
    inactive: "Inactiva",
    activate: "Activar",
    deactivate: "Desactivar",
    activateItem: (name: string) => `Activar ${name}`,
    deactivateItem: (name: string) => `Desactivar ${name}`,
    chooseCardToActivate: "Edítala y elige una tarjeta para activarla.",
    deleteBefore: "¿Eliminar ",
    deleteAfter:
      " para siempre? Los meses ya abiertos conservan sus ítems; los meses que abras de ahora en adelante no la tendrán.",
    loadFailed: "No se pudieron cargar las plantillas.",
    refreshFailed: "Se muestran las últimas plantillas recibidas; no se pudieron actualizar.",
    empty: "Todavía no hay plantillas. Agrega lo que se repite cada mes.",
    noneYet: "Todavía no hay.",
    add: "Agregar plantilla",
  },
  failures: {
    periodRejected: "Ese mes no se puede usar. Los meses empiezan en enero de 2000.",
    periodNotFound: "Este mes no se ha abierto. Recarga la página para verlo como está ahora.",
    templateRejected: "Ese cambio no se aceptó. Revisa los valores; un cargo a tarjeta activo debe conservar una tarjeta.",
    templateNotFound: "Esa plantilla ya no existe.",
  },
};

export const periods = { en, es };
