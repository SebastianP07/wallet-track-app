import Link from "next/link";

interface MessageScreenProps {
  title: string;
  message: string;
  linkLabel: string;
}

export function MessageScreen({ title, message, linkLabel }: MessageScreenProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-sm">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
        <p role="alert" className="mt-3 text-muted-foreground">
          {message}
        </p>
        <Link
          href="/"
          prefetch={false}
          className="mt-6 inline-flex min-h-12 items-center rounded-md border border-input px-4 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {linkLabel}
        </Link>
      </div>
    </main>
  );
}
