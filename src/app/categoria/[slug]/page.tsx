import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await prisma.categoria.findUnique({ where: { slug } });
  if (!cat) notFound();

  return (
    <main className="min-h-screen max-w-md mx-auto p-5 space-y-4">
      <Link href="/analizza" className="text-sm text-gray-400">← Lavoro / Casa</Link>
      <h1 className="text-xl font-semibold">{cat.nome}</h1>
      <p className="text-gray-500">Gestione voci in arrivo.</p>
    </main>
  );
}