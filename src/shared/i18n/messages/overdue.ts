const en = {
  copy: {
    empty: "Nothing overdue. Earlier months left nothing unpaid for this one.",
    notOpened: "Open this month to see what it owes from earlier months.",
    filtered: "No overdue items with this tag.",
    loadFailed: "The overdue list could not be loaded.",
    refreshFailed: "Showing the overdue items last loaded; they could not be refreshed.",
  },
  kinds: { fixed: "Fixed", occasional: "Occasional", income: "Income", card_charge: "Card charge" },
  groups: { expenses: "Expenses this month owes", income: "Income to receive" },
  totalsWholeList: "Overdue totals cover the whole list, whatever the tag.",
  from: (month: string) => `From ${month}`,
  notFound: "That item no longer exists, so it has left this list.",
};

export type OverdueMessages = typeof en;

const es: OverdueMessages = {
  copy: {
    empty: "No hay nada vencido. Los meses anteriores no le dejaron nada sin pagar a este.",
    notOpened: "Abre este mes para ver lo que debe de meses anteriores.",
    filtered: "No hay ítems vencidos con esta etiqueta.",
    loadFailed: "No se pudo cargar la lista de vencidos.",
    refreshFailed: "Se muestran los últimos vencidos cargados; no se pudieron actualizar.",
  },
  kinds: { fixed: "Fijo", occasional: "Ocasional", income: "Ingreso", card_charge: "Cargo a tarjeta" },
  groups: { expenses: "Gastos que debe este mes", income: "Ingresos por recibir" },
  totalsWholeList: "Los totales de vencidos cubren toda la lista, sin importar la etiqueta.",
  from: (month: string) => `De ${month}`,
  notFound: "Ese ítem ya no existe, así que salió de esta lista.",
};

export const overdue = { en, es };
