const en = {
  skipToMonth: "Skip to the month",
  goToMonth: (month: string) => `Go to ${month}`,
  logOut: "Log out",
  logOutEverywhere: "Log out everywhere",
  monthNav: "Month",
  previousMonth: (month: string) => `Previous month, ${month}`,
  nextMonth: (month: string) => `Next month, ${month}`,
  overviewLoadFailed: "The overview could not be loaded.",
  chartsLoadFailed: "The charts could not be loaded.",
  refreshFailed: "Showing the last numbers received; they could not be refreshed.",
  chartsNotOpened: "Open this month to see its charts.",
  kpis: {
    standing: "Where you stand",
    month: "The month's balance",
    currentTotal: "Total actual",
    currentTotalHint: "Today's balances, in any month",
    toPay: "To pay",
    toPayHint: "Pending fixed and occasional, plus overdue",
    toReceive: "To arrive",
    toReceiveHint: "Pending income",
    surplus: "Left over",
    surplusHint: "Total actual − to pay + to arrive",
    incoming: "Coming in",
    incomingHint: "All income, paid or not",
    outgoing: "Going out",
    outgoingHint: "All fixed, occasional and overdue, paid or not",
    balance: "Balance",
    balanceHint: "Coming in − going out",
    notOpenedNote: "Open this month to see the rest. Its balances are the same as in any month.",
    closedNote:
      "This month is closed, so what was pending is overdue: it stays in Coming in and Going out, and is out of To pay and To arrive. Unpaid expenses moved to the Overdue section of the next month that is not closed. Left over is therefore today's Total actual.",
  },
  sections: {
    kpis: {
      title: "Overview",
      description:
        "Total actual, to pay, to arrive, left over and the month's balance. Card charges count toward none of them; overdue expenses this month owes count in to pay and going out.",
    },
    charts: { title: "Charts", description: "To pay by kind, how the totals compare, and what is due next." },
    accounts: {
      title: "Accounts",
      description: "Where the money sits right now. Every account counts toward Total actual.",
    },
    "fixed-expenses": {
      title: "Fixed expenses",
      description:
        "Bills that come back every month, like rent or food. Add one here and it repeats in every month you open next.",
    },
    "occasional-expenses": {
      title: "Occasional expenses",
      description: "One-off payments this month, like a trip or a purchase.",
    },
    income: {
      title: "Income",
      description: "What should arrive this month. A salary can repeat every month; a one-off payment stays in this month.",
    },
    overdue: {
      title: "Overdue",
      description:
        "Expenses earlier months left unpaid, which this month owes, with their month of origin. They count in to pay and going out. Income still to receive from closed months is listed too, and counts toward no total.",
    },
    "card-charges": { title: "Card charges", description: "Auto-charges to anticipate each statement." },
    platforms: { title: "Platforms", description: "Shared subscriptions and who owes what." },
    templates: {
      title: "Recurring templates",
      description:
        "What opening a month copies into it. Changes apply to months opened from now on; months already opened keep their items.",
    },
    tags: {
      title: "Tags",
      description: "Your own labels for expenses, income and templates. They never change a total.",
    },
    security: {
      title: "Security",
      description:
        "Your passkeys and the devices signed in right now. Your authenticator app and recovery codes keep working alongside them.",
    },
  },
  // A closed section's header: how many items it holds and, where it has one, what they add up to.
  summaries: {
    accounts: (count: number, amount: string) => `${count} account${count === 1 ? "" : "s"} · ${amount}`,
    "fixed-expenses": (count: number, amount: string) =>
      `${count} item${count === 1 ? "" : "s"} · ${amount} to pay`,
    "occasional-expenses": (count: number, amount: string) =>
      `${count} item${count === 1 ? "" : "s"} · ${amount} to pay`,
    income: (count: number, amount: string) => `${count} item${count === 1 ? "" : "s"} · ${amount} to arrive`,
    overdue: (count: number, amount: string) =>
      count === 0 ? "Nothing overdue" : `${count} overdue · ${amount} to pay`,
    "card-charges": (count: number, amount: string) =>
      `${count} charge${count === 1 ? "" : "s"} · ${amount} pending`,
    platforms: (count: number) => `${count} platform${count === 1 ? "" : "s"}`,
    templates: (count: number) => `${count} template${count === 1 ? "" : "s"}`,
    tags: (count: number) => `${count} tag${count === 1 ? "" : "s"}`,
  },
  // The bottom bar; each label stays short enough for six of them on a phone.
  nav: {
    label: "Sections",
    overview: "Overview",
    accounts: "Accounts",
    expenses: "Expenses",
    income: "Income",
    cards: "Cards",
    templates: "Templates",
  },
  export: {
    action: "Export CSV",
    exporting: "Exporting…",
    actionFor: (month: string) => `Export CSV for ${month}`,
    exportingFor: (month: string) => `Exporting for ${month}`,
    downloaded: (fileName: string) => `Downloaded ${fileName}.`,
    notOpened: "This month has not been opened, so there is nothing to export.",
    tooMany: "Too many requests. Wait a moment and try again.",
    offline: "The export needs a connection. Nothing was downloaded.",
    failed: "The export failed. Nothing was downloaded.",
  },
  collapseAll: {
    action: "Collapse all",
    done: "Sections collapsed.",
  },
  offline: {
    nowOffline: "You're offline. Nothing can be changed until you reconnect.",
    backOnline: "You're back online.",
    offline: "You're offline.",
    neverLoaded: "This month's numbers never loaded on this page.",
    lastUpdated: (age: string) => `These numbers were last updated ${age} and may be out of date.`,
    nothingCanChange: "Nothing can be changed until you reconnect.",
    lessThanMinuteAgo: "less than a minute ago",
    minutesAgo: (count: number) => `${count} minute${count === 1 ? "" : "s"} ago`,
    hoursAgo: (count: number) => `${count} hour${count === 1 ? "" : "s"} ago`,
    daysAgo: (count: number) => `${count} day${count === 1 ? "" : "s"} ago`,
  },
  charts: {
    toPayByKind: "To pay by kind",
    nothingToPay: "Nothing left to pay this month.",
    toPayCaption: "To pay by kind: the amounts behind the chart.",
    kind: "Kind",
    amount: "Amount",
    share: "Share",
    fixed: "Fixed",
    occasional: "Occasional",
    overdue: "Overdue",
    toPayCenter: "to pay",
    totalsCompare: "How the totals compare",
    allZero: "All of these are zero this month.",
    totalsCaption: "The month's totals: the amounts behind the chart.",
    total: "Total",
  },
  upcoming: {
    title: "Upcoming due",
    nothingPending: "Nothing pending this month.",
    due: (date: string) => `Due ${date}`,
    noDueDate: "No due date",
    showFewer: "Show fewer",
    showAll: (count: number) => `Show all ${count}`,
  },
};

export type DashboardMessages = typeof en;

const es: DashboardMessages = {
  skipToMonth: "Saltar al mes",
  goToMonth: (month: string) => `Ir a ${month}`,
  logOut: "Cerrar sesión",
  logOutEverywhere: "Cerrar todas las sesiones",
  monthNav: "Mes",
  previousMonth: (month: string) => `Mes anterior, ${month}`,
  nextMonth: (month: string) => `Mes siguiente, ${month}`,
  overviewLoadFailed: "No se pudo cargar el resumen.",
  chartsLoadFailed: "No se pudieron cargar las gráficas.",
  refreshFailed: "Se muestran las últimas cifras recibidas; no se pudieron actualizar.",
  chartsNotOpened: "Abre este mes para ver sus gráficas.",
  kpis: {
    standing: "Cómo estás hoy",
    month: "Balance del mes",
    currentTotal: "Total actual",
    currentTotalHint: "Saldos de hoy, en cualquier mes",
    toPay: "Por pagar",
    toPayHint: "Fijos y ocasionales pendientes, más los vencidos",
    toReceive: "Por llegar",
    toReceiveHint: "Ingresos pendientes",
    surplus: "Sobrante",
    surplusHint: "Total actual − por pagar + por llegar",
    incoming: "Llega",
    incomingHint: "Todos los ingresos, recibidos o no",
    outgoing: "Se va",
    outgoingHint: "Todos los fijos, ocasionales y vencidos, pagados o no",
    balance: "Balance",
    balanceHint: "Llega − se va",
    notOpenedNote: "Abre este mes para ver el resto. Sus saldos son los mismos que en cualquier mes.",
    closedNote:
      "Este mes está cerrado, así que lo que estaba pendiente quedó vencido: sigue en Llega y Se va, y sale de Por pagar y Por llegar. Los gastos sin pagar pasaron a la sección Vencidos del siguiente mes que no esté cerrado. Por eso el Sobrante es el Total actual de hoy.",
  },
  sections: {
    kpis: {
      title: "Resumen",
      description:
        "Total actual, por pagar, por llegar, sobrante y el balance del mes. Los cargos a tarjeta no cuentan en ninguno; los gastos vencidos que debe este mes cuentan en por pagar y en se va.",
    },
    charts: {
      title: "Gráficas",
      description: "Por pagar según el tipo, cómo se comparan los totales y lo próximo que vence.",
    },
    accounts: {
      title: "Cuentas",
      description: "Dónde está la plata en este momento. Todas las cuentas suman al Total actual.",
    },
    "fixed-expenses": {
      title: "Gastos fijos",
      description:
        "Pagos que vuelven cada mes, como el arriendo o la comida. Si agregas uno aquí, se repite en cada mes que abras después.",
    },
    "occasional-expenses": {
      title: "Gastos ocasionales",
      description: "Pagos únicos de este mes, como un viaje o una compra.",
    },
    income: {
      title: "Ingresos",
      description: "Lo que debería llegar este mes. Un sueldo puede repetirse cada mes; un pago único se queda en este mes.",
    },
    overdue: {
      title: "Vencidos",
      description:
        "Gastos que meses anteriores dejaron sin pagar y que debe este mes, con su mes de origen. Cuentan en por pagar y en se va. También aparecen los ingresos por recibir de meses cerrados, que no cuentan en ningún total.",
    },
    "card-charges": {
      title: "Cargos a tarjeta",
      description: "Débitos automáticos para anticipar cada extracto.",
    },
    platforms: { title: "Plataformas", description: "Suscripciones compartidas y quién debe qué." },
    templates: {
      title: "Plantillas recurrentes",
      description:
        "Lo que se copia al abrir un mes. Los cambios aplican a los meses que abras de ahora en adelante; los meses ya abiertos conservan sus ítems.",
    },
    tags: {
      title: "Etiquetas",
      description: "Tus propias etiquetas para gastos, ingresos y plantillas. Nunca cambian un total.",
    },
    security: {
      title: "Seguridad",
      description:
        "Tus llaves de acceso y los dispositivos con sesión iniciada en este momento. Tu app de autenticación y tus códigos de recuperación siguen funcionando junto a ellas.",
    },
  },
  summaries: {
    accounts: (count: number, amount: string) => `${count} cuenta${count === 1 ? "" : "s"} · ${amount}`,
    "fixed-expenses": (count: number, amount: string) =>
      `${count} ítem${count === 1 ? "" : "s"} · ${amount} por pagar`,
    "occasional-expenses": (count: number, amount: string) =>
      `${count} ítem${count === 1 ? "" : "s"} · ${amount} por pagar`,
    income: (count: number, amount: string) => `${count} ítem${count === 1 ? "" : "s"} · ${amount} por llegar`,
    overdue: (count: number, amount: string) =>
      count === 0 ? "Nada vencido" : `${count} vencido${count === 1 ? "" : "s"} · ${amount} por pagar`,
    "card-charges": (count: number, amount: string) =>
      `${count} cargo${count === 1 ? "" : "s"} · ${amount} pendiente`,
    platforms: (count: number) => `${count} plataforma${count === 1 ? "" : "s"}`,
    templates: (count: number) => `${count} plantilla${count === 1 ? "" : "s"}`,
    tags: (count: number) => `${count} etiqueta${count === 1 ? "" : "s"}`,
  },
  nav: {
    label: "Secciones",
    overview: "Resumen",
    accounts: "Cuentas",
    expenses: "Gastos",
    income: "Ingresos",
    cards: "Tarjetas",
    templates: "Plantillas",
  },
  export: {
    action: "Exportar CSV",
    exporting: "Exportando…",
    actionFor: (month: string) => `Exportar CSV de ${month}`,
    exportingFor: (month: string) => `Exportando ${month}`,
    downloaded: (fileName: string) => `Se descargó ${fileName}.`,
    notOpened: "Este mes no se ha abierto, así que no hay nada para exportar.",
    tooMany: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
    offline: "La exportación necesita conexión. No se descargó nada.",
    failed: "La exportación falló. No se descargó nada.",
  },
  collapseAll: {
    action: "Colapsar todo",
    done: "Secciones colapsadas.",
  },
  offline: {
    nowOffline: "Estás sin conexión. No se puede cambiar nada hasta que vuelvas a conectarte.",
    backOnline: "Volviste a estar en línea.",
    offline: "Estás sin conexión.",
    neverLoaded: "Las cifras de este mes nunca se cargaron en esta página.",
    lastUpdated: (age: string) => `Estas cifras se actualizaron por última vez ${age} y pueden estar desactualizadas.`,
    nothingCanChange: "No se puede cambiar nada hasta que vuelvas a conectarte.",
    lessThanMinuteAgo: "hace menos de un minuto",
    minutesAgo: (count: number) => `hace ${count} minuto${count === 1 ? "" : "s"}`,
    hoursAgo: (count: number) => `hace ${count} hora${count === 1 ? "" : "s"}`,
    daysAgo: (count: number) => `hace ${count} día${count === 1 ? "" : "s"}`,
  },
  charts: {
    toPayByKind: "Por pagar según el tipo",
    nothingToPay: "No queda nada por pagar este mes.",
    toPayCaption: "Por pagar según el tipo: los valores detrás de la gráfica.",
    kind: "Tipo",
    amount: "Valor",
    share: "Porcentaje",
    fixed: "Fijos",
    occasional: "Ocasionales",
    overdue: "Vencidos",
    toPayCenter: "por pagar",
    totalsCompare: "Cómo se comparan los totales",
    allZero: "Todos estos están en cero este mes.",
    totalsCaption: "Los totales del mes: los valores detrás de la gráfica.",
    total: "Total",
  },
  upcoming: {
    title: "Próximos vencimientos",
    nothingPending: "No hay nada pendiente este mes.",
    due: (date: string) => `Vence el ${date}`,
    noDueDate: "Sin fecha de vencimiento",
    showFewer: "Ver menos",
    showAll: (count: number) => `Ver los ${count}`,
  },
};

export const dashboard = { en, es };
