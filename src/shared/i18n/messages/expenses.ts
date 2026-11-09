type DoneWord = "paid" | "received" | "charged";

const en = {
  copy: {
    fixed: {
      add: "Add fixed expense",
      empty: "No fixed expenses this month.",
      filtered: "No fixed expenses with this tag.",
      notOpened: "Open this month to see its fixed expenses.",
      loadFailed: "These expenses could not be loaded.",
      refreshFailed: "Showing the last expenses received; they could not be refreshed.",
      closed: "This month is closed, so it takes no new items. Its items can still be paid, edited or deleted.",
      summary: "To pay",
    },
    occasional: {
      add: "Add occasional expense",
      empty: "No occasional expenses this month.",
      filtered: "No occasional expenses with this tag.",
      notOpened: "Open this month to see its occasional expenses.",
      loadFailed: "These expenses could not be loaded.",
      refreshFailed: "Showing the last expenses received; they could not be refreshed.",
      closed: "This month is closed, so it takes no new items. Its items can still be paid, edited or deleted.",
      summary: "To pay",
    },
  },
  dueDate: "Due date",
  due: (date: string) => `Due ${date}`,
  owedIn: (month: string) => `Owed in ${month}`,
  repeatMonthly: "Repeat every month",
  repeatHintFixed: "Every month you open from now on gets it too, due on the same day. Untick it for this month only.",
  saveChanges: "Save changes",
  markAs: (name: string, word: DoneWord) =>
    `Mark ${name} as ${word}`,
  editItem: (name: string) => `Edit ${name}`,
  deleteItem: (name: string) => `Delete ${name}`,
  onlyThisMonth: "Only this month",
  onlyThisMonthAria: (name: string) => `Delete ${name} from this month only`,
  stopRepeating: "Stop repeating too",
  stopRepeatingAria: (name: string) => `Delete ${name} and stop repeating it`,
  repeatsConfirm:
    " repeats every month. Delete it from this month only, so months opened later still get it, or also stop repeating it. Earlier months keep theirs, paid or not.",
  deleteFromMonthBefore: "Delete ",
  deleteFromMonthAfter: " from this month?",
  templateStays: "Its template stays as it is.",
  doneMarkGoes: (word: DoneWord) => ` It is marked ${word} here, and that mark goes with it.`,
  owedMonthStops: (month: string) => ` ${month}, which owes it, stops counting it.`,
  badges: { paid: "Paid", overdue: "Overdue", urgent: "Urgent", dueSoon: "Due soon" },
  kinds: { fixed: "Fixed", occasional: "Occasional" },
  order: {
    handle: (name: string) => `Move ${name}`,
    instructions:
      "Drag to change the order, or use the up and down arrow keys while this button has focus. Press it to show Up and Down buttons. Paid and received items stay above pending ones.",
    up: "Up",
    down: "Down",
    upAria: (name: string) => `Move ${name} up`,
    downAria: (name: string) => `Move ${name} down`,
    done: "Done",
    doneAria: (name: string) => `Stop moving ${name}`,
    moved: (name: string, position: number, total: number) => `${name} moved to position ${position} of ${total}.`,
    atTop: (name: string, position: number, total: number) =>
      `${name} is at position ${position} of ${total} and cannot move further up.`,
    atBottom: (name: string, position: number, total: number) =>
      `${name} is at position ${position} of ${total} and cannot move further down.`,
  },
  failures: {
    rejected: "That change was not accepted. Check the values; amounts and the month's totals have a limit.",
    notFound: "That item no longer exists. Reload the page to see the month as it is now.",
    closed: "This month is closed, so it takes no new items.",
  },
};

export type ExpensesMessages = typeof en;

const DONE_WORDS_ES: Record<DoneWord, string> = { paid: "pagado", received: "recibido", charged: "cobrado" };

const es: ExpensesMessages = {
  copy: {
    fixed: {
      add: "Agregar gasto fijo",
      empty: "No hay gastos fijos este mes.",
      filtered: "No hay gastos fijos con esta etiqueta.",
      notOpened: "Abre este mes para ver sus gastos fijos.",
      loadFailed: "No se pudieron cargar estos gastos.",
      refreshFailed: "Se muestran los últimos gastos recibidos; no se pudieron actualizar.",
      closed: "Este mes está cerrado, así que no recibe ítems nuevos. Sus ítems todavía se pueden pagar, editar o eliminar.",
      summary: "Por pagar",
    },
    occasional: {
      add: "Agregar gasto ocasional",
      empty: "No hay gastos ocasionales este mes.",
      filtered: "No hay gastos ocasionales con esta etiqueta.",
      notOpened: "Abre este mes para ver sus gastos ocasionales.",
      loadFailed: "No se pudieron cargar estos gastos.",
      refreshFailed: "Se muestran los últimos gastos recibidos; no se pudieron actualizar.",
      closed: "Este mes está cerrado, así que no recibe ítems nuevos. Sus ítems todavía se pueden pagar, editar o eliminar.",
      summary: "Por pagar",
    },
  },
  dueDate: "Fecha de vencimiento",
  due: (date: string) => `Vence el ${date}`,
  owedIn: (month: string) => `Lo debe ${month}`,
  repeatMonthly: "Repetir cada mes",
  repeatHintFixed:
    "Cada mes que abras de ahora en adelante también lo tendrá, con vencimiento el mismo día. Desmárcalo si es solo para este mes.",
  saveChanges: "Guardar cambios",
  markAs: (name: string, word: DoneWord) => `Marcar ${name} como ${DONE_WORDS_ES[word]}`,
  editItem: (name: string) => `Editar ${name}`,
  deleteItem: (name: string) => `Eliminar ${name}`,
  onlyThisMonth: "Solo este mes",
  onlyThisMonthAria: (name: string) => `Eliminar ${name}: solo este mes`,
  stopRepeating: "Dejar de repetirlo también",
  stopRepeatingAria: (name: string) => `Eliminar ${name} y dejar de repetirlo también`,
  repeatsConfirm:
    " se repite cada mes. Elimínalo solo de este mes, para que los meses que abras después lo sigan teniendo, o deja de repetirlo también. Los meses anteriores conservan el suyo, pagado o no.",
  deleteFromMonthBefore: "¿Eliminar ",
  deleteFromMonthAfter: " de este mes?",
  templateStays: "Su plantilla queda como está.",
  doneMarkGoes: (word: DoneWord) => ` Aquí está marcado como ${DONE_WORDS_ES[word]}, y esa marca se va con él.`,
  owedMonthStops: (month: string) => ` El mes que lo debe, ${month}, deja de contarlo.`,
  badges: { paid: "Pagado", overdue: "Vencido", urgent: "Urgente", dueSoon: "Vence pronto" },
  kinds: { fixed: "Fijo", occasional: "Ocasional" },
  order: {
    handle: (name: string) => `Mover ${name}`,
    instructions:
      "Arrastra para cambiar el orden, o usa las flechas arriba y abajo con este botón enfocado. Al presionarlo aparecen los botones Subir y Bajar. Lo pagado o recibido queda arriba de lo pendiente.",
    up: "Subir",
    down: "Bajar",
    upAria: (name: string) => `Subir ${name}`,
    downAria: (name: string) => `Bajar ${name}`,
    done: "Listo",
    doneAria: (name: string) => `Dejar de mover ${name}`,
    moved: (name: string, position: number, total: number) => `${name} movido a la posición ${position} de ${total}.`,
    atTop: (name: string, position: number, total: number) =>
      `${name} está en la posición ${position} de ${total} y no puede subir más.`,
    atBottom: (name: string, position: number, total: number) =>
      `${name} está en la posición ${position} de ${total} y no puede bajar más.`,
  },
  failures: {
    rejected: "Ese cambio no se aceptó. Revisa los valores; los montos y los totales del mes tienen un límite.",
    notFound: "Ese ítem ya no existe. Recarga la página para ver el mes como está ahora.",
    closed: "Este mes está cerrado, así que no recibe ítems nuevos.",
  },
};

export const expenses = { en, es };
