import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PeriodItem } from "../../domain/types";
import { ItemRow } from "./item-row";

const RENT: PeriodItem = {
  id: "item-1",
  period: "2026-11",
  kind: "fixed",
  name: "Arriendo",
  amount: 1500000,
  dueDate: null,
  tagId: null,
  templateId: null,
  personId: null,
  platformId: null,
  cardId: null,
  status: "pending",
  doneAt: null,
  owedIn: null,
  urgency: "none",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
} as PeriodItem;

function renderRow(item: PeriodItem, onSetDone: (done: boolean) => Promise<unknown>) {
  return render(
    <ul>
      <ItemRow item={item} tags={[]} doneWord="paid" details={null} onSetDone={onSetDone} />
    </ul>,
  );
}

describe("ItemRow done toggle", () => {
  it("asks before marking an item as paid and only then sends it", async () => {
    const onSetDone = vi.fn().mockResolvedValue(undefined);
    renderRow(RENT, onSetDone);

    fireEvent.click(screen.getByRole("button", { name: "Marcar Arriendo como pagado" }));

    expect(screen.getByRole("alertdialog", { name: "¿Marcar «Arriendo» como pagado?" })).toBeInTheDocument();
    expect(onSetDone).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Marcar como pagado" })));

    expect(onSetDone).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("asks before unmarking a paid item", async () => {
    const onSetDone = vi.fn().mockResolvedValue(undefined);
    renderRow({ ...RENT, status: "done" }, onSetDone);

    fireEvent.click(screen.getByRole("button", { name: "Marcar Arriendo como pagado" }));
    expect(screen.getByRole("alertdialog", { name: "¿Desmarcar «Arriendo»?" })).toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Desmarcar" })));

    expect(onSetDone).toHaveBeenCalledWith(false);
  });

  it("sends nothing when the question is cancelled", () => {
    const onSetDone = vi.fn();
    renderRow(RENT, onSetDone);

    fireEvent.click(screen.getByRole("button", { name: "Marcar Arriendo como pagado" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onSetDone).not.toHaveBeenCalled();
  });
});
