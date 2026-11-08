const en = {
  add: "Add account",
  balanceInPesos: "Balance in pesos",
  newBalanceInPesos: "New balance in pesos",
  saveBalance: "Save balance",
  saveName: "Save name",
  updateBalance: "Update balance",
  updateBalanceOf: (name: string) => `Update balance of ${name}`,
  renameItem: (name: string) => `Rename ${name}`,
  deleteItem: (name: string) => `Delete ${name}`,
  deleteBefore: "Delete ",
  deleteAfter: " for good? This can't be undone.",
  loadFailed: "These balances could not be loaded.",
  totalActual: "Total actual",
  refreshFailed: "Showing the last values received; they could not be refreshed.",
  empty: "No accounts yet. Add the first one to see your total.",
  failures: {
    rejected: "That change was not accepted. Check the name and the amount; amounts and totals have a limit.",
    notFound: "That account no longer exists.",
  },
};

export type AccountsMessages = typeof en;

const es: AccountsMessages = {
  add: "Agregar cuenta",
  balanceInPesos: "Saldo en pesos",
  newBalanceInPesos: "Nuevo saldo en pesos",
  saveBalance: "Guardar saldo",
  saveName: "Guardar nombre",
  updateBalance: "Actualizar saldo",
  updateBalanceOf: (name: string) => `Actualizar saldo de ${name}`,
  renameItem: (name: string) => `Cambiar nombre de ${name}`,
  deleteItem: (name: string) => `Eliminar ${name}`,
  deleteBefore: "¿Eliminar ",
  deleteAfter: " para siempre? Esto no se puede deshacer.",
  loadFailed: "No se pudieron cargar estos saldos.",
  totalActual: "Total actual",
  refreshFailed: "Se muestran los últimos valores recibidos; no se pudieron actualizar.",
  empty: "Todavía no hay cuentas. Agrega la primera para ver tu total.",
  failures: {
    rejected: "Ese cambio no se aceptó. Revisa el nombre y el valor; los valores y los totales tienen un límite.",
    notFound: "Esa cuenta ya no existe.",
  },
};

export const accounts = { en, es };
