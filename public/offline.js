// The offline fallback: a read-only view of the last Dashboard this device saved, with no controls that could
// write. Static and nonce-free, so public/sw.js can store it. Every number is the backend's (D1).
(() => {
  const DATA_CACHE = "wallet-track-offline-data";
  const DATA_KEY = "/offline-data/dashboard";
  const SAVED_AT_HEADER = "X-Saved-At";
  // No session lives longer than this, so nothing saved under one should either.
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const MINUTE_MS = 60 * 1000;

  const dateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
  const dueDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const DONE_WORD = { fixed: "Paid", occasional: "Paid", income: "Received", card_charge: "Charged" };
  const PENDING_WORD = { fixed: "To pay", occasional: "To pay", income: "Expected", card_charge: "Expected" };

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
    if (minutes < 1) return "less than a minute ago";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
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
    const status = item.status === "done" ? DONE_WORD[item.kind] : item.status === "overdue" ? "Overdue" : PENDING_WORD[item.kind];
    const due = item.dueDate ? `Due ${dueDate.format(new Date(`${item.dueDate}T00:00:00Z`))} · ` : "";
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
      ageText.textContent = `You're offline. This is the Dashboard saved ${describeAge(Date.now() - savedAt)} (${dateTime.format(savedAt)}), and it may be out of date. Nothing can be changed until you reconnect.`;
    };
    refreshAge();
    setInterval(refreshAge, MINUTE_MS);

    const month = el("h2", { textContent: monthTitle.format(new Date(`${period.period}-01T00:00:00Z`)) });
    document.getElementById("content").replaceChildren(
      // Not a live region: it is the page's first content and its age changes each minute.
      el("div", { className: "banner" }, ageText, el("a", { className: "action", href: "/", textContent: "Try again" })),
      month,
      kpis([
        ["Total actual", k.currentTotal],
        ["To pay", k.toPay],
        ["To arrive", k.toReceive],
        ["Left over", k.surplus],
        ["Coming in", k.incoming],
        ["Going out", k.outgoing],
        ["Balance", k.balance],
      ]),
      el(
        "div",
        { className: "grid" },
        section("Accounts", accountEntries(accounts.items), "No accounts."),
        section("Fixed expenses", itemEntries(items.items, "fixed"), "No fixed expenses."),
        section("Occasional expenses", itemEntries(items.items, "occasional"), "No occasional expenses."),
        section("Income", itemEntries(items.items, "income"), "No income."),
        section(
          "Overdue",
          overdue.items.map((item) => ({ name: item.name, pesos: item.amount, detail: `From ${item.period} · ${itemDetail(item)}` })),
          "Nothing overdue.",
        ),
        section("Card charges", itemEntries(items.items, "card_charge"), "No card charges."),
        section(
          "Who owes what, per month",
          people.items.map((person) => ({ name: person.name, pesos: person.monthlyOwed })),
          "No people.",
        ),
      ),
    );
    document.title = "Offline Dashboard · Wallet Track";
  }

  // Chromium can fire this with navigator.onLine still false while a navigation is on its way, and reloading then
  // would cancel that navigation.
  window.addEventListener("online", () => {
    if (navigator.onLine) window.location.reload();
  });

  // Only the Dashboard's own address shows saved numbers; /login and the rest get the plain page.
  if (window.location.pathname === "/") {
    readSaved()
      .then((saved) => {
        if (saved) render(saved);
      })
      .catch(() => {
        // The plain offline page is already showing.
      });
  }
})();
