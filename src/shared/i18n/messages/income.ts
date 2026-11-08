const en = {
  copy: {
    add: "Add income",
    empty: "No income this month.",
    filtered: "No income with this tag.",
    notOpened: "Open this month to see its income.",
    loadFailed: "This income could not be loaded.",
    refreshFailed: "Showing the income last loaded; it could not be refreshed.",
    closed: "This month is closed, so it takes no new items. Its items can still be marked received, edited or deleted.",
    summary: "To arrive",
  },
  repeatHint: "Every month you open from now on gets it too, like a salary. Leave it unticked for this month only.",
  platformDeleteNote:
    "A payment recorded for it stays, with its coverage. Opening the month again won't bring this item back.",
  sharedPlatforms: "Shared platforms",
  badges: { expected: "Expected", received: "Received", overdue: "Overdue" },
};

export type IncomeMessages = typeof en;

const es: IncomeMessages = {
  copy: {
    add: "Agregar ingreso",
    empty: "No hay ingresos este mes.",
    filtered: "No hay ingresos con esta etiqueta.",
    notOpened: "Abre este mes para ver sus ingresos.",
    loadFailed: "No se pudieron cargar estos ingresos.",
    refreshFailed: "Se muestran los últimos ingresos cargados; no se pudieron actualizar.",
    closed:
      "Este mes está cerrado, así que no recibe ítems nuevos. Sus ítems todavía se pueden marcar como recibidos, editar o eliminar.",
    summary: "Por llegar",
  },
  repeatHint:
    "Cada mes que abras de ahora en adelante también lo tendrá, como un sueldo. Déjalo sin marcar si es solo para este mes.",
  platformDeleteNote:
    "El pago registrado para él se conserva, con su cobertura. Volver a abrir el mes no traerá de vuelta este ítem.",
  sharedPlatforms: "Plataformas compartidas",
  badges: { expected: "Esperado", received: "Recibido", overdue: "Vencido" },
};

export const income = { en, es };
