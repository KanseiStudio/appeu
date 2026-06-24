"use server";

import { revalidatePath } from "next/cache";
import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";

function passo(periodo: string): number | null {
  if (periodo === "MENSILE") return 1;
  if (periodo === "BIMESTRALE") return 2;
  if (periodo === "ANNUALE") return 12;
  return null; // ONE_SHOT
}

export async function creaVoce(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const importo = Number(String(formData.get("importo") ?? "").replace(",", "."));
  const periodo = String(formData.get("periodo") ?? "");
  const dataInizioStr = String(formData.get("dataInizio") ?? "");
  const rinnovoAutomatico = formData.get("rinnovoAutomatico") === "on";

  const cat = await prisma.categoria.findUnique({ where: { slug } });
  if (!cat || !nome || Number.isNaN(importo)) return;

  const dataInizio = dataInizioStr ? new Date(dataInizioStr) : new Date();
  const p = passo(periodo);
  const prossimoRinnovo = p === null ? null : addMonths(dataInizio, p);

  await prisma.voce.create({
    data: {
      categoriaId: cat.id,
      nome,
      importo,
      periodo: periodo as "ONE_SHOT" | "MENSILE" | "BIMESTRALE" | "ANNUALE",
      dataInizio,
      prossimoRinnovo,
      rinnovoAutomatico,
    },
  });

  revalidatePath(`/categoria/${slug}`);
  revalidatePath("/");
  revalidatePath("/analizza");
}

export async function eliminaVoce(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await prisma.voce.delete({ where: { id } });
  revalidatePath(`/categoria/${slug}`);
  revalidatePath("/");
  revalidatePath("/analizza");
}