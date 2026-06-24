import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginAction } from "@/app/actions/auth";
import SoundButton from "@/components/SoundButton";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const imp = await prisma.impostazioni.findUnique({ where: { id: "singleton" } });
  if (!imp) redirect("/setup");

  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={loginAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Accedi</h1>
        {error && <p className="text-sm text-red-600">PIN errato.</p>}
        <input name="pin" type="password" inputMode="numeric" placeholder="PIN"
          className="w-full border rounded-lg px-3 py-2" required autoFocus />
        <SoundButton className="w-full bg-black text-white rounded-lg py-2">Entra</SoundButton>
      </form>
    </main>
  );
}