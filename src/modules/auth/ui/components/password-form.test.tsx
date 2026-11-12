import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PasswordForm } from "./password-form";

function renderForm(onSubmit = vi.fn()) {
  render(<PasswordForm failure={null} pending={false} onSubmit={onSubmit} onInvalid={vi.fn()} />);
  return {
    email: screen.getByLabelText("Correo electrónico"),
    password: screen.getByLabelText("Contraseña"),
    onSubmit,
  };
}

describe("PasswordForm", () => {
  it("exposes the credentials so password managers can fill them", () => {
    const { email, password } = renderForm();

    expect(email.closest("form")).toHaveAttribute("method", "post");
    expect(email).toHaveAttribute("name", "email");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "username");
    expect(password).toHaveAttribute("name", "password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).not.toHaveAttribute("readonly");
  });

  it("shows and hides the password without submitting the form", () => {
    const { password, onSubmit } = renderForm();

    const show = screen.getByRole("button", { name: "Mostrar contraseña" });
    expect(show).toHaveAttribute("type", "button");
    expect(show).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(show);

    const hide = screen.getByRole("button", { name: "Ocultar contraseña" });
    expect(hide).toHaveAttribute("aria-pressed", "true");
    expect(password).toHaveAttribute("type", "text");

    fireEvent.click(hide);

    expect(screen.getByRole("button", { name: "Mostrar contraseña" })).toHaveAttribute("aria-pressed", "false");
    expect(password).toHaveAttribute("type", "password");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the typed credentials", async () => {
    const { email, password, onSubmit } = renderForm();

    fireEvent.change(email, { target: { value: "owner@example.com" } });
    fireEvent.change(password, { target: { value: "correct horse battery staple" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { email: "owner@example.com", password: "correct horse battery staple" },
        expect.anything(),
      ),
    );
  });
});
