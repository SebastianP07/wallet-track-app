import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";
import { ActionError } from "@/shared/feedback/action-error";

type Harness = Pick<ConfirmDialogProps, "onConfirm" | "destructive">;

function Harness({ onConfirm, destructive }: Harness) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Pagar arriendo
      </button>
      <ConfirmDialog
        open={open}
        title="¿Marcar «Arriendo» como pagado?"
        description="Deja de contar como pendiente en este mes."
        confirmLabel="Marcar como pagado"
        destructive={destructive}
        onConfirm={onConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function openDialog(props: Harness) {
  render(<Harness {...props} />);
  const opener = screen.getByRole("button", { name: "Pagar arriendo" });
  opener.focus();
  fireEvent.click(opener);
  return { opener, dialog: screen.getByRole("alertdialog", { name: "¿Marcar «Arriendo» como pagado?" }) };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

const setOnline = (online: boolean) => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(online);
  window.dispatchEvent(new Event(online ? "online" : "offline"));
};

describe("ConfirmDialog", () => {
  afterEach(() => vi.restoreAllMocks());

  it("names the action and the item, describes it and starts on the way out", () => {
    const { dialog } = openDialog({ onConfirm: vi.fn() });

    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("Deja de contar como pendiente en este mes.");
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("closes on Cancel without confirming and returns focus to what opened it", () => {
    const onConfirm = vi.fn();
    const { opener } = openDialog({ onConfirm });

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(opener).toHaveFocus();
  });

  it("closes on Escape", () => {
    const { dialog } = openDialog({ onConfirm: vi.fn() });

    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows the action pending, ignores Escape meanwhile and closes once it succeeds", async () => {
    const answer = deferred();
    const { dialog } = openDialog({ onConfirm: () => answer.promise });

    fireEvent.click(screen.getByRole("button", { name: "Marcar como pagado" }));

    const pending = screen.getByRole("button", { name: "Confirmando…" });
    expect(pending).toHaveAttribute("aria-disabled", "true");
    expect(dialog).toHaveAttribute("aria-busy", "true");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(dialog).toBeInTheDocument();

    await act(async () => answer.resolve());

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("stays open with the reason when the action fails, and can be tried again", async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new ActionError("Este mes está cerrado."))
      .mockResolvedValueOnce(undefined);
    openDialog({ onConfirm });

    fireEvent.click(screen.getByRole("button", { name: "Marcar como pagado" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este mes está cerrado.");
    const confirm = screen.getByRole("button", { name: "Marcar como pagado" });
    expect(confirm).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(confirm);

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("falls back to a generic reason for an unexpected failure", async () => {
    openDialog({ onConfirm: () => Promise.reject(new Error("boom")) });

    fireEvent.click(screen.getByRole("button", { name: "Marcar como pagado" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo completar la acción.");
  });

  it("styles a destructive confirmation as such", () => {
    openDialog({ onConfirm: vi.fn(), destructive: true });

    expect(screen.getByRole("button", { name: "Marcar como pagado" })).toHaveClass("bg-destructive");
  });

  it("cannot confirm while offline, but can still be cancelled", () => {
    setOnline(false);
    const onConfirm = vi.fn();
    openDialog({ onConfirm });

    expect(screen.getByText("Sin conexión. Conéctate de nuevo para confirmar.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar como pagado" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
  });
});
