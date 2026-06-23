"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export async function setupAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const pin2 = String(formData.get("pin2") ?? "");
  const saldoRaw = String(formData.get("saldoIniziale") ?? "").replace(",", ".");

  if (!/^\d{4,8}$/.test(pin)) redirect("/setup?error=pin");
  if (pin !== pin2) redirect("/setup?error=match");
  const saldo = Number(saldoRaw);
  if (Number.isNaN(saldo)) redirect("/setup?error=saldo");

  const existing = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
  if (existing) redirect("/login");

  const pinHash = await bcrypt.hash(pin, 10);
  await prisma.impostazioni.create({
    data: { id: "singleton", pinHash, saldoIniziale: saldo },
  });

  await createSession();
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
  if (!imp) redirect("/setup");

  const ok = await bcrypt.compare(pin, imp.pinHash);
  if (!ok) redirect("/login?error=1");

  await createSession();
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}