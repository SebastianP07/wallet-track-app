const en = {
  filterGroup: "Filter items by tag",
  filter: "Filter",
  all: "All",
  color: "Color",
  editTag: (name: string) => `Edit tag ${name}`,
  deleteTag: (name: string) => `Delete tag ${name}`,
  deleteBefore: "Delete ",
  deleteAfter: " for good? Items and templates that have it stay, without a tag.",
  loadFailed: "The tags could not be loaded.",
  refreshFailed: "Showing the last tags received; they could not be refreshed.",
  empty: "No tags yet. Add one to group expenses and income your way.",
  add: "Add tag",
  failures: {
    rejected: "That tag was not accepted. Check its name and color.",
    notFound: "That tag no longer exists.",
    nameTaken: "Another tag already has that name.",
  },
};

export type TagsMessages = typeof en;

const es: TagsMessages = {
  filterGroup: "Filtrar ítems por etiqueta",
  filter: "Filtro",
  all: "Todos",
  color: "Color",
  editTag: (name: string) => `Editar la etiqueta ${name}`,
  deleteTag: (name: string) => `Eliminar la etiqueta ${name}`,
  deleteBefore: "¿Eliminar ",
  deleteAfter: " para siempre? Los ítems y las plantillas que la tienen se quedan, sin etiqueta.",
  loadFailed: "No se pudieron cargar las etiquetas.",
  refreshFailed: "Se muestran las últimas etiquetas recibidas; no se pudieron actualizar.",
  empty: "Todavía no hay etiquetas. Agrega una para agrupar gastos e ingresos a tu manera.",
  add: "Agregar etiqueta",
  failures: {
    rejected: "Esa etiqueta no se aceptó. Revisa su nombre y su color.",
    notFound: "Esa etiqueta ya no existe.",
    nameTaken: "Ya hay otra etiqueta con ese nombre.",
  },
};

export const tags = { en, es };
