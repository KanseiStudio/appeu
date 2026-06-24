import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // prima le voci (figlie), poi le categorie (padri)
    const voci = await prisma.voce.deleteMany({});
    const categorie = await prisma.categoria.deleteMany({});
    console.log(`Eliminate ${voci.count} voci e ${categorie.count} categorie.`);
    // NB: Impostazioni (PIN, saldo) NON toccate.
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());