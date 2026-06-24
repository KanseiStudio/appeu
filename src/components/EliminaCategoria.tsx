import Link from "next/link";
import { getCategorieConTotali } from "@/lib/data";
import { creaCategoria } from "@/app/actions/categorie";

export const dynamic = "force-dynamic";

const eur = (n: number) => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

type Item = { slug: string; nome: string; tipo: string; totale: number };

function Sezione({
  titolo,
  area,
  items,
}: {
  titolo: string;
  area: "LAVORO" | "CASA";
  items: Item[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-center text-sm uppercase tracking-widest text-gray-400">{titolo}</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((c) => (
          <Link key={c.slug} href={`/categoria/${c.slug}`}
            className="rounded-xl border p-4 active:scale-95 transition">
            <p className="font-medium leading-snug">{c.nome}</p>
            <p className={`mt-2 text-sm ${c.tipo === "ENTRATA" ? "text-green-600" : "text-red-600"}`}>
              {eur(c.totale)}
            </p>
          </Link>
        ))}
      </div>
      <form action={creaCategoria} className="flex gap-2 items-center">
        <input type="hidden" name="area" value={area} />
        <input name="nome" placeholder="Nuova categoria" required
          className="flex-1 border rounded-lg px-3 py-2 bg-transparent text-sm" />
        <select name="tipo" className="border rounded-lg px-2 py-2 bg-transparent text-sm">
          <option value="USCITA">Uscita</option>
          <option value="ENTRATA">Entrata</option>
        </select>
        <button className="border rounded-lg px-3 py-2 text-sm">+</button>
      </form>
    </section>
  );
}

export default async function AnalizzaPage() {
  const { lavoro, casa } = await getCategorieConTotali();
  return (
    <main className="min-h-screen max-w-md mx-auto p-5 space-y-8">
      <Link href="/" className="text-sm text-gray-400">← Home</Link>
      <Sezione titolo="Lavoro" area="LAVORO" items={lavoro} />
      <Sezione titolo="Casa" area="CASA" items={casa} />
    </main>
  );
}