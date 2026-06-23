import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categorie = [
  { slug: "entrate-lavori",        nome: "Entrate lavori",              area: "LAVORO", tipo: "ENTRATA" },
  { slug: "gestione-software",     nome: "Gestione Software",           area: "LAVORO", tipo: "USCITA"  },
  { slug: "gestione-utenze-sede",  nome: "Gestione Utenze sede",        area: "LAVORO", tipo: "USCITA"  },
  { slug: "gestione-affitti-sede", nome: "Gestione Affitti sede",       area: "LAVORO", tipo: "USCITA"  },
  { slug: "gestione-materiale-hw", nome: "Gestione Materiale hardware", area: "LAVORO", tipo: "USCITA"  },
  { slug: "stipendi",              nome: "Stipendi",                    area: "LAVORO", tipo: "USCITA"  },
  { slug: "casa-utenze",           nome: "Gestione Utenze",             area: "CASA",   tipo: "USCITA"  },
  { slug: "casa-abbonamenti",      nome: "Gestione Abbonamenti",        area: "CASA",   tipo: "USCITA"  },
  { slug: "casa-cibo",             nome: "Gestione Cibo e ristoranti",  area: "CASA",   tipo: "USCITA"  },
  { slug: "casa-extra",            nome: "Gestione Extra",              area: "CASA",   tipo: "USCITA"  },
] as const;

async function main() {
  for (const c of categorie) {
    await prisma.categoria.upsert({
      where: { slug: c.slug },
      update: { nome: c.nome, area: c.area, tipo: c.tipo },
      create: { ...c },
    });
  }
  console.log(`Seed completato: ${categorie.length} categorie.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });