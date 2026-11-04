export function FormAlert({ message }: { message: string | null | undefined }) {
  // Stays mounted while empty: screen readers announce changes to a live region they already know.
  return (
    <div role="alert" className="empty:hidden">
      {message ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
