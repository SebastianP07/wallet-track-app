import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RefreshContainer } from "./refresh-container";
import { ApiError } from "@/shared/api/http-client";
import { dismissToast, getToasts } from "@/shared/feedback/toast-store";

function Reader({ queryKey, read }: { queryKey: string; read: () => Promise<string> }) {
  const { data } = useQuery({ queryKey: [queryKey], queryFn: read, retry: false });
  return <p>{data}</p>;
}

function renderWith(children: ReactNode) {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      {children}
      <RefreshContainer />
    </QueryClientProvider>,
  );
  return client;
}

const messages = () => getToasts().map(({ tone, message }) => ({ tone, message }));

describe("RefreshContainer", () => {
  afterEach(() => act(() => getToasts().forEach((toast) => dismissToast(toast.id))));

  it("refetches what is shown without emptying it, then says so", async () => {
    let answer!: (value: string) => void;
    const read = vi
      .fn()
      .mockResolvedValueOnce("antes")
      .mockImplementationOnce(() => new Promise<string>((resolve) => (answer = resolve)));
    renderWith(<Reader queryKey="accounts" read={read} />);
    expect(await screen.findByText("antes")).toBeInTheDocument();
    const refresh = screen.getByRole("button", { name: "Actualizar datos" });
    expect(refresh).toHaveAttribute("title", "Actualizar datos");
    await waitFor(() => expect(refresh).toBeEnabled());

    fireEvent.click(refresh);

    await waitFor(() => expect(refresh).toBeDisabled());
    expect(screen.getByText("antes")).toBeInTheDocument();
    expect(messages()).toEqual([]);

    act(() => answer("después"));

    expect(await screen.findByText("después")).toBeInTheDocument();
    await waitFor(() => expect(messages()).toEqual([{ tone: "success", message: "Datos actualizados." }]));
    expect(refresh).toBeEnabled();
  });

  it("reports a refetch that failed", async () => {
    const accounts = vi.fn().mockResolvedValueOnce("cuentas").mockRejectedValueOnce(new Error("offline"));
    const overdue = vi.fn().mockRejectedValue(new ApiError(404));
    renderWith(
      <>
        <Reader queryKey="accounts" read={accounts} />
        <Reader queryKey="overdue" read={overdue} />
      </>,
    );
    expect(await screen.findByText("cuentas")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Actualizar datos" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Actualizar datos" }));

    await waitFor(() =>
      expect(messages()).toEqual([
        { tone: "error", message: "No se pudieron actualizar los datos. Inténtalo de nuevo." },
      ]),
    );
  });

  it("does not report a failure for a month with no period", async () => {
    const overdue = vi.fn().mockRejectedValue(new ApiError(404));
    renderWith(<Reader queryKey="overdue" read={overdue} />);
    await waitFor(() => expect(overdue).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole("button", { name: "Actualizar datos" })).toBeEnabled());

    fireEvent.click(screen.getByRole("button", { name: "Actualizar datos" }));

    await waitFor(() => expect(messages()).toEqual([{ tone: "success", message: "Datos actualizados." }]));
  });
});
