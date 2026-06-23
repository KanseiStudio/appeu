import Link from "next/link";
import { getCategorieConTotali } from "@/lib/data";

const eur = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

type Item = { slug: string; nome: string; tipo: string; totale: number };

function Sezione({ titolo, items }: { titolo: string; items: Item[] }) {
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
    </section>
  );
}

export default async function AnalizzaPage() {
  const { lavoro, casa } = await getCategorieConTotali();
  return (
    <main className="min-h-screen max-w-md mx-auto p-5 space-y-8">
      <Link href="/" className="text-sm text-gray-400">← Home</Link>
      <Sezione titolo="Lavoro" items={lavoro} />
      <Sezione titolo="Casa" items={casa} />
    </main>
  );
}