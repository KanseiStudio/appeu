import { subMonths, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  saldoConto, totaleMese, variazionePerc, prossimoRinnovo,
  type VoceCalc, type Periodo, type Tipo,
} from "@/lib/calc";

export async function getDashboard() {
  const oggi = new Date();
  const meseScorso = subMonths(oggi, 1);

  const [imp, vociDb] = await Promise.all([
    prisma.impostazioni.findUnique({ where: { id: "singleton" } }),
    prisma.voce.findMany({ include: { categoria: true } }),
  ]);

  const saldoIniziale = imp ? Number(imp.saldoIniziale) : 0;
  const voci: VoceCalc[] = vociDb.map((v) => ({
    importo: Number(v.importo),
    periodo: v.periodo as Periodo,
    dataInizio: v.dataInizio,
    tipo: v.categoria.tipo as Tipo,
  }));

  const usciteMese = totaleMese(voci, "USCITA", oggi);
  const usciteMesePrec = totaleMese(voci, "USCITA", meseScorso);
  const entrateMese = totaleMese(voci, "ENTRATA", oggi);
  const entrateMesePrec = totaleMese(voci, "ENTRATA", meseScorso);

  return {
    saldo: saldoConto(saldoIniziale, voci, oggi),
    saldoIniziale,
    uscite: { valore: usciteMese, varPerc: variazionePerc(usciteMese, usciteMesePrec) },
    entrate: { valore: entrateMese, varPerc: variazionePerc(entrateMese, entrateMesePrec) },
  };
}

const ORDINE = [
  "entrate-lavori", "gestione-software", "gestione-utenze-sede",
  "gestione-affitti-sede", "gestione-materiale-hw", "stipendi",
  "casa-utenze", "casa-abbonamenti", "casa-cibo", "casa-extra",
];

export async function getCategorieConTotali() {
  const oggi = new Date();
  const categorie = await prisma.categoria.findMany({ include: { voci: true } });

  const conTotali = categorie
    .map((c) => {
      const voci: VoceCalc[] = c.voci.map((v) => ({
        importo: Number(v.importo),
        periodo: v.periodo as Periodo,
        dataInizio: v.dataInizio,
        tipo: c.tipo as Tipo,
      }));
      return {
        slug: c.slug,
        nome: c.nome,
        area: c.area as "LAVORO" | "CASA",
        tipo: c.tipo as Tipo,
        totale: totaleMese(voci, c.tipo as Tipo, oggi),
      };
    })
.sort((a, b) => {
      const ia = ORDINE.indexOf(a.slug), ib = ORDINE.indexOf(b.slug);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.nome.localeCompare(b.nome);
    });
  return {
    lavoro: conTotali.filter((c) => c.area === "LAVORO"),
    casa: conTotali.filter((c) => c.area === "CASA"),
  };
}

export async function getAlertRinnovi(giorni = 3) {
  const oggi = new Date();
  const vociDb = await prisma.voce.findMany({ include: { categoria: true } });

  return vociDb
    .map((v) => {
      const calcV: VoceCalc = {
        importo: Number(v.importo),
        periodo: v.periodo as Periodo,
        dataInizio: v.dataInizio,
        tipo: v.categoria.tipo as Tipo,
      };
      const prossimo = prossimoRinnovo(calcV, oggi);
      if (!prossimo) return null;
      const giorniMancanti = differenceInCalendarDays(prossimo, oggi);
      if (giorniMancanti < 0 || giorniMancanti > giorni) return null;
      return {
        id: v.id,
        nome: v.nome,
        categoria: v.categoria.nome,
        importo: Number(v.importo),
        giorniMancanti,
        automatico: v.rinnovoAutomatico,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.giorniMancanti - b.giorniMancanti);
}