import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toaster } from "./toaster";
import { dismissToast, getToasts, notify, TOAST_DURATION_MS } from "@/shared/feedback/toast-store";

describe("Toaster", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => getToasts().forEach((toast) => dismissToast(toast.id)));
    vi.useRealTimers();
  });

  it("announces a success politely and an error as an alert", () => {
    render(<Toaster />);

    act(() => {
      notify.success("Se marcó «Arriendo» como pagado.");
      notify.error("Este mes está cerrado.");
    });

    expect(screen.getByRole("status")).toHaveTextContent("Se marcó «Arriendo» como pagado.");
    expect(screen.getByRole("alert")).toHaveTextContent("Este mes está cerrado.");
  });

  it("dismisses each notice on its own after a while, an error later than a success", () => {
    render(<Toaster />);
    act(() => {
      notify.success("Se guardó el nuevo orden.");
      notify.error("No se pudo guardar.");
    });

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS.success));

    expect(screen.queryByText("Se guardó el nuevo orden.")).not.toBeInTheDocument();
    expect(screen.getByText("No se pudo guardar.")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS.error - TOAST_DURATION_MS.success));

    expect(screen.queryByText("No se pudo guardar.")).not.toBeInTheDocument();
  });

  it("can be dismissed at once", () => {
    render(<Toaster />);
    act(() => notify.success("Se eliminó «Arriendo»."));

    fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));

    expect(screen.queryByText("Se eliminó «Arriendo».")).not.toBeInTheDocument();
  });

  it("replaces a repeated notice instead of stacking it, and keeps at most three", () => {
    render(<Toaster />);

    act(() => {
      notify.success("Se guardó el nuevo orden.");
      notify.success("Se guardó el nuevo orden.");
    });
    expect(screen.getAllByText("Se guardó el nuevo orden.")).toHaveLength(1);

    act(() => ["Uno.", "Dos.", "Tres."].forEach(notify.success));

    expect(screen.queryByText("Se guardó el nuevo orden.")).not.toBeInTheDocument();
    expect(getToasts().map((toast) => toast.message)).toEqual(["Uno.", "Dos.", "Tres."]);
  });
});
