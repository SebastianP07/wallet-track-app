// The offline fallback: a read-only view of the last Dashboard this device saved, with no controls that could
// write. Static and nonce-free, so public/sw.js can store it. Every number is the backend's (D1).
(() => {
  const DATA_CACHE = "wallet-track-offline-data";
  const DATA_KEY = "/offline-data/dashboard";
  const SAVED_AT_HEADER = "X-Saved-At";
  // No session lives longer than this, so nothing saved under one should either.
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const MINUTE_MS = 60 * 1000;

  // src/shared/i18n/locale.ts names the cookie and the default too. The app's messages are not reachable from
  // here, so the few this page needs are copied, with the same words.
  const LOCALE_COOKIE = "locale";
  const LANGUAGE_TAGS = { es: "es-CO", en: "en-US" };
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`));
  const locale = cookie?.slice(LOCALE_COOKIE.length + 1) === "en" ? "en" : "es";
  const tag = LANGUAGE_TAGS[locale];

  const TEXT = {
    es: {
      title: "Sin conexión · Wallet Track",
      dashboardTitle: "Tablero sin conexión · Wallet Track",
      description: "Wallet Track sin conexión.",
      tryAgain: "Intentar de nuevo",
      saved: (age, at) =>
        `Estás sin conexión. Este es el tablero guardado ${age} (${at}) y puede estar desactualizado. No se puede cambiar nada hasta que vuelvas a conectarte.`,
      lessThanMinute: "hace menos de un minuto",
      minutes: (n) => `hace ${n} minuto${n === 1 ? "" : "s"}`,
      hours: (n) => `hace ${n} hora${n === 1 ? "" : "s"}`,
      days: (n) => `hace ${n} día${n === 1 ? "" : "s"}`,
      done: { fixed: "Pagado", occasional: "Pagado", income: "Recibido", card_charge: "Cobrado" },
      pending: { fixed: "Por pagar", occasional: "Por pagar", income: "Esperado", card_charge: "Esperado" },
      overdue: "Vencido",
      due: (date) => `Vence el ${date}`,
      from: (month) => `De ${month}`,
      kpis: ["Total actual", "Por pagar", "Por llegar", "Sobrante", "Llega", "Se va", "Balance"],
      sections: {
        accounts: ["Cuentas", "No hay cuentas."],
        fixed: ["Gastos fijos", "No hay gastos fijos."],
        occasional: ["Gastos ocasionales", "No hay gastos ocasionales."],
        income: ["Ingresos", "No hay ingresos."],
        overdue: ["Vencidos", "No hay nada vencido."],
        cardCharges: ["Cargos a tarjeta", "No hay cargos a tarjeta."],
        people: ["Quién debe qué, por mes", "No hay personas."],
      },
    },
    en: {
      title: "Offline · Wallet Track",
      dashboardTitle: "Offline Dashboard · Wallet Track",
      description: "Wallet Track while there is no connection.",
      tryAgain: "Try again",
      saved: (age, at) =>
        `You're offline. This is the Dashboard saved ${age} (${at}), and it may be out of date. Nothing can be changed until you reconnect.`,
      lessThanMinute: "less than a minute ago",
      minutes: (n) => `${n} minute${n === 1 ? "" : "s"} ago`,
      hours: (n) => `${n} hour${n === 1 ? "" : "s"} ago`,
      days: (n) => `${n} day${n === 1 ? "" : "s"} ago`,
      done: { fixed: "Paid", occasional: "Paid", income: "Received", card_charge: "Charged" },
      pending: { fixed: "To pay", occasional: "To pay", income: "Expected", card_charge: "Expected" },
      overdue: "Overdue",
      due: (date) => `Due ${date}`,
      from: (month) => `From ${month}`,
      kpis: ["Total actual", "To pay", "To arrive", "Left over", "Coming in", "Going out", "Balance"],
      sections: {
        accounts: ["Accounts", "No accounts."],
        fixed: ["Fixed expenses", "No fixed expenses."],
        occasional: ["Occasional expenses", "No occasional expenses."],
        income: ["Income", "No income."],
        overdue: ["Overdue", "Nothing overdue."],
        cardCharges: ["Card charges", "No card charges."],
        people: ["Who owes what, per month", "No people."],
      },
    },
  }[locale];

  // This runs from <head>, before the body exists: the CSS shows only the notice in this language.
  document.documentElement.lang = tag;
  document.title = TEXT.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", TEXT.description);

  // The same DD/MM/YY and DD/MM/YY HH:mm as src/shared/format/date.ts, which this page cannot import.
  const bogotaParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const formatDate = (date) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    return match ? `${match[3]}/${match[2]}/${match[1].slice(2)}` : date;
  };
  const formatDateTime = (timestamp) => {
    const parts = Object.fromEntries(bogotaParts.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]));
    return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
  };
  const monthTitle = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" });
  const monthOnly = (period) => monthTitle.format(new Date(`${period}-01T00:00:00Z`));

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    node.append(...children.filter((child) => child !== null));
    return node;
  }

  function formatCOP(pesos) {
    const digits = Math.abs(pesos).toString().replace(/\B(?=(\d{3})+$)/g, ".");
    return `${pesos < 0 ? "-" : ""}$ ${digits}`;
  }

  function describeAge(ms) {
    const minutes = Math.floor(ms / MINUTE_MS);
    if (minutes < 1) return TEXT.lessThanMinute;
    if (minutes < 60) return TEXT.minutes(minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return TEXT.hours(hours);
    return TEXT.days(Math.floor(hours / 24));
  }

  async function readSaved() {
    if (!("caches" in window)) return null;
    const stored = await caches.match(DATA_KEY, { cacheName: DATA_CACHE });
    if (!stored) return null;
    const savedAt = Number(stored.headers.get(SAVED_AT_HEADER));
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > MAX_AGE_MS) {
      await caches.delete(DATA_CACHE);
      return null;
    }
    return { savedAt, dashboard: await stored.json() };
  }

  function amount(pesos) {
    return el("span", { className: pesos < 0 ? "amount negative" : "amount", textContent: formatCOP(pesos) });
  }

  function rows(entries) {
    return el(
      "ul",
      { className: "rows" },
      ...entries.map(({ name, pesos, detail }) =>
        el(
          "li",
          {},
          el("div", { className: "row-head" }, el("span", { textContent: name }), amount(pesos)),
          detail ? el("div", { className: "detail", textContent: detail }) : null,
        ),
      ),
    );
  }

  function section(title, entries, emptyText) {
    return el(
      "section",
      {},
      el("h3", { textContent: title }),
      entries.length > 0 ? rows(entries) : el("p", { className: "muted", textContent: emptyText }),
    );
  }

  function kpis(values) {
    return el(
      "dl",
      { className: "kpis" },
      ...values.map(([label, pesos]) =>
        el("div", {}, el("dt", { textContent: label }), el("dd", { className: pesos < 0 ? "negative" : "", textContent: formatCOP(pesos) })),
      ),
    );
  }

  function itemDetail(item) {
    const status =
      item.status === "done" ? TEXT.done[item.kind] : item.status === "overdue" ? TEXT.overdue : TEXT.pending[item.kind];
    const due = item.dueDate ? `${TEXT.due(formatDate(item.dueDate))} · ` : "";
    return `${due}${status}`;
  }

  function itemEntries(items, kind) {
    return items
      .filter((item) => item.kind === kind)
      .map((item) => ({ name: item.name, pesos: item.amount, detail: itemDetail(item) }));
  }

  function accountEntries(accounts) {
    return accounts.map((account) => ({ name: account.name, pesos: account.balance }));
  }

  function render({ savedAt, dashboard }) {
    const { kpis: k, items, accounts, overdue, people, period } = dashboard;
    const ageText = el("p", {});
    const refreshAge = () => {
      ageText.textContent = TEXT.saved(describeAge(Date.now() - savedAt), formatDateTime(savedAt));
    };
    refreshAge();
    setInterval(refreshAge, MINUTE_MS);

    const month = el("h2", { className: "month-title", textContent: monthOnly(period.period) });
    document.getElementById("content").replaceChildren(
      // Not a live region: it is the page's first content and its age changes each minute.
      el("div", { className: "banner" }, ageText, el("a", { className: "action", href: "/", textContent: TEXT.tryAgain })),
      month,
      kpis(
        [k.currentTotal, k.toPay, k.toReceive, k.surplus, k.incoming, k.outgoing, k.balance].map((pesos, index) => [
          TEXT.kpis[index],
          pesos,
        ]),
      ),
      el(
        "div",
        { className: "grid" },
        section(TEXT.sections.accounts[0], accountEntries(accounts.items), TEXT.sections.accounts[1]),
        section(TEXT.sections.fixed[0], itemEntries(items.items, "fixed"), TEXT.sections.fixed[1]),
        section(TEXT.sections.occasional[0], itemEntries(items.items, "occasional"), TEXT.sections.occasional[1]),
        section(TEXT.sections.income[0], itemEntries(items.items, "income"), TEXT.sections.income[1]),
        section(
          TEXT.sections.overdue[0],
          overdue.items.map((item) => ({
            name: item.name,
            pesos: item.amount,
            detail: `${TEXT.from(monthOnly(item.period))} · ${itemDetail(item)}`,
          })),
          TEXT.sections.overdue[1],
        ),
        section(TEXT.sections.cardCharges[0], itemEntries(items.items, "card_charge"), TEXT.sections.cardCharges[1]),
        section(
          TEXT.sections.people[0],
          people.items.map((person) => ({ name: person.name, pesos: person.monthlyOwed })),
          TEXT.sections.people[1],
        ),
      ),
    );
    document.title = TEXT.dashboardTitle;
  }

  // Chromium can fire this with navigator.onLine still false while a navigation is on its way, and reloading then
  // would cancel that navigation.
  window.addEventListener("online", () => {
    if (navigator.onLine) window.location.reload();
  });

  // Only the Dashboard's own address shows saved numbers; /login and the rest get the plain page.
  // This script runs from <head>, so the page's content is only there once the document is parsed.
  if (window.location.pathname === "/") {
    // On failure the plain offline page is already showing.
    const savedDashboard = readSaved().catch(() => null);
    document.addEventListener("DOMContentLoaded", () => {
      void savedDashboard.then((saved) => {
        if (saved) render(saved);
      });
    });
  }
})();
