import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { creaVoce, eliminaVoce } from "@/app/actions/voci";
import { totaleMese, type VoceCalc, type Periodo, type Tipo } from "@/lib/calc";
import EliminaCategoria from "@/components/EliminaCategoria";
import { eliminaCategoria } from "@/app/actions/categorie";

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const periodoLabel: Record<string, string> = {
  ONE_SHOT: "Una tantum", MENSILE: "Mensile", BIMESTRALE: "Bimestrale", ANNUALE: "Annuale",
};
export const dynamic = "force-dynamic";
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await prisma.categoria.findUnique({
    where: { slug },
    include: { voci: { orderBy: { createdAt: "desc" } } },
  });
  if (!cat) notFound();

  const oggi = new Date();
  const voci: VoceCalc[] = cat.voci.map((v) => ({
    importo: Number(v.importo),
    periodo: v.periodo as Periodo,
    dataInizio: v.dataInizio,
    tipo: cat.tipo as Tipo,
  }));
  const totale = totaleMese(voci, cat.tipo as Tipo, oggi);
  const oggiStr = oggi.toISOString().slice(0, 10);

  return (
    <main className="min-h-screen max-w-md mx-auto p-5 space-y-6">
      <Link href="/analizza" className="text-sm text-gray-400">← Lavoro / Casa</Link>
      <h1 className="text-xl font-semibold">{cat.nome}</h1>

      <form action={creaVoce} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm uppercase tracking-wide text-gray-400">Aggiungi voce</p>
        <input type="hidden" name="slug" value={cat.slug} />
        <input name="nome" placeholder="Nome" required
          className="w-full border rounded-lg px-3 py-2 bg-transparent" />
        <div className="grid grid-cols-2 gap-3">
          <input name="importo" inputMode="decimal" placeholder="Costo (€)" required
            className="w-full border rounded-lg px-3 py-2 bg-transparent" />
          <select name="periodo" required
            className="w-full border rounded-lg px-3 py-2 bg-transparent">
            <option value="ONE_SHOT">Una tantum</option>
            <option value="MENSILE">Mensile</option>
            <option value="BIMESTRALE">Bimestrale</option>
            <option value="ANNUALE">Annuale</option>
          </select>
        </div>
        <label className="block text-sm text-gray-400">
          Data inizio
          <input type="date" name="dataInizio" defaultValue={oggiStr}
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-transparent" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" name="rinnovoAutomatico" /> Rinnovo automatico
        </label>
        <button className="w-full bg-black text-white border rounded-lg py-2">Aggiungi</button>
      </form>

      <div className="flex justify-between items-center px-1">
        <span className="text-sm uppercase tracking-wide text-gray-400">Totale mese</span>
        <span className={`font-semibold ${cat.tipo === "ENTRATA" ? "text-green-600" : "text-red-600"}`}>
          {eur(totale)}
        </span>
      </div>

      <section className="space-y-2">
        {cat.voci.length === 0 && <p className="text-gray-500 text-sm">Nessuna voce.</p>}
        {cat.voci.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="font-medium">{v.nome}</p>
              <p className="text-xs text-gray-500">{periodoLabel[v.periodo]}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{eur(Number(v.importo))}</span>
              <form action={eliminaVoce}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="slug" value={cat.slug} />
                <button className="text-xs text-red-500">Elimina</button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}