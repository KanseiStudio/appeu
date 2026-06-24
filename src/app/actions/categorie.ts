"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function slugify(s: string): string {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function creaCategoria(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const area = String(formData.get("area") ?? "");
  const tipo = String(formData.get("tipo") ?? "USCITA");
  if (!nome || (area !== "LAVORO" && area !== "CASA")) return;

  const base = slugify(nome) || "categoria";
  let slug = base;
  let n = 2;
  while (await prisma.categoria.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.categoria.create({
    data: {
      slug,
      nome,
      area: area as "LAVORO" | "CASA",
      tipo: tipo as "ENTRATA" | "USCITA",
    },
  });

  revalidatePath("/analizza");
  revalidatePath("/");
}

export async function eliminaCategoria(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  await prisma.categoria.delete({ where: { slug } }); // cascata: elimina anche le voci
  revalidatePath("/analizza");
  revalidatePath("/");
  redirect("/analizza");
}