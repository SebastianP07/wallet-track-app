import type { ReactNode } from "react";

interface LoginLayoutProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function LoginLayout({ eyebrow, title, description, children }: LoginLayoutProps) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div
        aria-hidden="true"
        className="ledger-rules relative flex flex-col justify-end overflow-hidden border-b border-rule py-6 pr-6 pl-[4.25rem] lg:border-r lg:border-b-0 lg:py-12"
      >
        <p className="rise-in font-heading text-[clamp(3rem,15vw,5rem)] leading-[0.82] font-extrabold tracking-tight lg:text-[clamp(6rem,13vw,13rem)]">
          Wallet
          <br />
          <span className="text-signal">Track</span>
        </p>
        <p className="mt-5 hidden font-mono text-xs text-muted-foreground lg:block">
          Private monthly cash control.
        </p>
      </div>
      <div className="flex items-start justify-center px-5 py-8 sm:px-8 lg:items-center lg:py-12">
        <div className="rise-in w-full max-w-sm">
          <p className="font-mono text-xs tracking-wide text-signal">{eyebrow}</p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">{title}</h1>
          {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
