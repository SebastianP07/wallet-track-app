import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1>Wallet Track</h1>
          </CardTitle>
          <CardDescription>Private monthly cash control.</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
