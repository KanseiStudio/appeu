import Link from "next/link";
import Gauge from "@/components/Gauge";
import AlertRinnovi from "@/components/AlertRinnovi";
import { getDashboard, getAlertRinnovi } from "@/lib/data";
import { logoutAction } from "@/app/actions/auth";
export const dynamic = "force-dynamic";

export default async function Home() {
  const [d, alert] = await Promise.all([getDashboard(), getAlertRinnovi(3)]);
  const scala = Math.max(d.saldoIniziale, Math.abs(d.saldo)) || 1;

  const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
  const pct = (p: number | null) => (p === null ? "—" : `${p > 0 ? "+" : ""}${p.toFixed(0)}%`);

  return (
    <main className="min-h-screen max-w-md mx-auto p-5 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">AppEU</h1>
        <form action={logoutAction}>
          <button className="text-xs text-gray-400">Esci</button>
        </form>
      </header>

      <AlertRinnovi alert={alert} />

      <Gauge value={d.saldo} scale={scala} />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Uscite</p>
          <p className="text-lg font-semibold text-red-600">{eur(d.uscite.valore)}</p>
          <p className="text-sm text-gray-500">{pct(d.uscite.varPerc)} vs mese prec.</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Entrate</p>
          <p className="text-lg font-semibold text-green-600">{eur(d.entrate.valore)}</p>
          <p className="text-sm text-gray-500">{pct(d.entrate.varPerc)} vs mese prec.</p>
        </div>
      </div>

      <Link href="/analizza"
        className="block text-center bg-black text-white rounded-xl py-3 font-medium">
        Analizza
      </Link>
    </main>
  );
}