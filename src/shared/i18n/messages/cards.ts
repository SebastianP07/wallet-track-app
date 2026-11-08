const en = {
  chargeCopy: {
    add: "Add card charge",
    empty: "No card charges this month.",
    filtered: "No card charges with this tag.",
    notOpened: "Open this month to see its card charges.",
    loadFailed: "These card charges could not be loaded.",
    refreshFailed: "Showing the card charges last loaded; they could not be refreshed.",
    closed: "This month is closed, so it takes no new charges. Its charges can still be marked, edited or deleted.",
    summary: "On cards this month",
  },
  deletedCard: "Deleted card",
  informational:
    "Informational: these charges never count toward To pay, Going out or Balance. The real outflow is the statement payment, so register that as an occasional expense when you pay the card.",
  card: "Card",
  chooseCard: "Choose a card",
  keepWithoutCard: "Keep without a card",
  needsCard: "A card charge needs a card. Add your first one under Cards, below.",
  charged: "Charged",
  expected: "Expected",
  cardName: "Card name",
  issuer: "Issuer",
  statementDay: "Statement day",
  dueDay: "Due day",
  totalsLoadFailed: "The per-card totals could not be loaded.",
  totalsWholeMonth: "Card totals cover the whole month, whatever the tag.",
  cardDeleted: "Their card was deleted. Edit a charge to move it to another card.",
  noCharges: "No charges this month.",
  cards: "Cards",
  cardsLoadFailed: "The cards could not be loaded.",
  cardsRefreshFailed: "Showing the last cards received; they could not be refreshed.",
  noCards: "No cards yet. Add one to start tracking its charges.",
  addCard: "Add card",
  cardDays: (issuer: string, statementDay: number, dueDay: number) =>
    `${issuer} · Statement on day ${statementDay} · Due on day ${dueDay}`,
  editCard: (name: string) => `Edit card ${name}`,
  deleteCard: (name: string) => `Delete card ${name}`,
  deleteBefore: "Delete ",
  deleteAfter:
    " for good? Its active card charge templates become inactive, so months opened from now on won't get those charges. Charges already in a month stay, under Deleted card.",
  failures: {
    rejected: "That card was not accepted. Check its name, issuer and days.",
    notFound: "That card no longer exists.",
  },
};

export type CardsMessages = typeof en;

const es: CardsMessages = {
  chargeCopy: {
    add: "Agregar cargo a tarjeta",
    empty: "No hay cargos a tarjeta este mes.",
    filtered: "No hay cargos a tarjeta con esta etiqueta.",
    notOpened: "Abre este mes para ver sus cargos a tarjeta.",
    loadFailed: "No se pudieron cargar estos cargos a tarjeta.",
    refreshFailed: "Se muestran los últimos cargos a tarjeta cargados; no se pudieron actualizar.",
    closed:
      "Este mes está cerrado, así que no recibe cargos nuevos. Sus cargos todavía se pueden marcar, editar o eliminar.",
    summary: "En tarjetas este mes",
  },
  deletedCard: "Tarjeta eliminada",
  informational:
    "Informativo: estos cargos nunca cuentan en Por pagar, Se va ni Balance. La salida real de plata es el pago del extracto, así que regístralo como gasto ocasional cuando pagues la tarjeta.",
  card: "Tarjeta",
  chooseCard: "Elige una tarjeta",
  keepWithoutCard: "Dejar sin tarjeta",
  needsCard: "Un cargo a tarjeta necesita una tarjeta. Agrega la primera en Tarjetas, más abajo.",
  charged: "Cobrado",
  expected: "Esperado",
  cardName: "Nombre de la tarjeta",
  issuer: "Banco emisor",
  statementDay: "Día de corte",
  dueDay: "Día de pago",
  totalsLoadFailed: "No se pudieron cargar los totales por tarjeta.",
  totalsWholeMonth: "Los totales por tarjeta cubren todo el mes, sin importar la etiqueta.",
  cardDeleted: "Su tarjeta se eliminó. Edita un cargo para pasarlo a otra tarjeta.",
  noCharges: "No hay cargos este mes.",
  cards: "Tarjetas",
  cardsLoadFailed: "No se pudieron cargar las tarjetas.",
  cardsRefreshFailed: "Se muestran las últimas tarjetas recibidas; no se pudieron actualizar.",
  noCards: "Todavía no hay tarjetas. Agrega una para empezar a seguir sus cargos.",
  addCard: "Agregar tarjeta",
  cardDays: (issuer: string, statementDay: number, dueDay: number) =>
    `${issuer} · Corte el día ${statementDay} · Pago el día ${dueDay}`,
  editCard: (name: string) => `Editar la tarjeta ${name}`,
  deleteCard: (name: string) => `Eliminar la tarjeta ${name}`,
  deleteBefore: "¿Eliminar ",
  deleteAfter:
    " para siempre? Sus plantillas activas de cargos a tarjeta quedan inactivas, así que los meses que abras de ahora en adelante no tendrán esos cargos. Los cargos que ya están en un mes se quedan, en Tarjeta eliminada.",
  failures: {
    rejected: "Esa tarjeta no se aceptó. Revisa su nombre, el banco emisor y los días.",
    notFound: "Esa tarjeta ya no existe.",
  },
};

export const cards = { en, es };
