import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setupAction } from "@/app/actions/auth";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const existing = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
  if (existing) redirect("/login");

  const { error } = await searchParams;
  const messaggi: Record<string, string> = {
    pin: "Il PIN deve essere di 4–8 cifre.",
    match: "I due PIN non coincidono.",
    saldo: "Inserisci un saldo iniziale valido.",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={setupAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Configura l&apos;app</h1>
        <p className="text-sm text-gray-500">Imposta il PIN e il saldo iniziale del conto.</p>
        {error && <p className="text-sm text-red-600">{messaggi[error] ?? "Errore."}</p>}
        <input name="pin" type="password" inputMode="numeric" placeholder="PIN (4–8 cifre)"
          className="w-full border rounded-lg px-3 py-2" required />
        <input name="pin2" type="password" inputMode="numeric" placeholder="Conferma PIN"
          className="w-full border rounded-lg px-3 py-2" required />
        <input name="saldoIniziale" type="text" inputMode="decimal" placeholder="Saldo iniziale (€)"
          className="w-full border rounded-lg px-3 py-2" required />
        <button type="submit" className="w-full bg-black text-white rounded-lg py-2">Avvia</button>
      </form>
    </main>
  );
}