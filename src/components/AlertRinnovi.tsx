type Alert = {
  id: string; nome: string; categoria: string;
  importo: number; giorniMancanti: number; automatico: boolean;
};

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const quando = (g: number) => (g === 0 ? "oggi" : g === 1 ? "domani" : `tra ${g} giorni`);

export default function AlertRinnovi({ alert }: { alert: Alert[] }) {
  if (alert.length === 0) return null;
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
      <p className="text-sm font-medium text-amber-500">⏰ Prossimi pagamenti</p>
      <ul className="space-y-1">
        {alert.map((a) => (
          <li key={a.id} className="text-sm flex justify-between gap-2">
            <span>{a.nome} · <span className="text-gray-400">{a.categoria}</span></span>
            <span className="whitespace-nowrap text-gray-300">{eur(a.importo)} · {quando(a.giorniMancanti)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}