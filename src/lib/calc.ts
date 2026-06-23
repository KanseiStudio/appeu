import { addMonths, isAfter, isSameMonth, startOfMonth, endOfMonth } from "date-fns";

export type Periodo = "ONE_SHOT" | "MENSILE" | "BIMESTRALE" | "ANNUALE";
export type Tipo = "ENTRATA" | "USCITA";

export interface VoceCalc {
  importo: number;
  periodo: Periodo;
  dataInizio: Date;
  tipo: Tipo;
}

// mesi che compongono il periodo (per l'ammortamento)
export function mesiPeriodo(p: Periodo): number {
  if (p === "BIMESTRALE") return 2;
  if (p === "ANNUALE") return 12;
  return 1; // ONE_SHOT, MENSILE
}

// passo in mesi tra due scadenze (null = non ricorrente)
export function passoMesi(p: Periodo): number | null {
  if (p === "MENSILE") return 1;
  if (p === "BIMESTRALE") return 2;
  if (p === "ANNUALE") return 12;
  return null; // ONE_SHOT
}

// contributo mensile ammortizzato
export function contributoMensile(v: VoceCalc): number {
  return v.importo / mesiPeriodo(v.periodo);
}

// la voce contribuisce al mese di riferimento? (vista ammortizzata)
export function contribuisceAlMese(v: VoceCalc, riferimento: Date): boolean {
  if (v.periodo === "ONE_SHOT") return isSameMonth(v.dataInizio, riferimento);
  return !isAfter(startOfMonth(v.dataInizio), endOfMonth(riferimento));
}

// totale ammortizzato di un tipo per il mese
export function totaleMese(voci: VoceCalc[], tipo: Tipo, riferimento: Date): number {
  return voci
    .filter((v) => v.tipo === tipo && contribuisceAlMese(v, riferimento))
    .reduce((s, v) => s + (v.periodo === "ONE_SHOT" ? v.importo : contributoMensile(v)), 0);
}

// variazione % vs mese precedente (null se precedente = 0)
export function variazionePerc(corrente: number, precedente: number): number | null {
  if (precedente === 0) return null;
  return ((corrente - precedente) / precedente) * 100;
}

// scadenze maturate da dataInizio a oggi (incluse)
export function occorrenzeMaturate(v: VoceCalc, oggi: Date): number {
  if (isAfter(v.dataInizio, oggi)) return 0;
  const passo = passoMesi(v.periodo);
  if (passo === null) return 1; // ONE_SHOT passato
  let count = 0;
  let d = v.dataInizio;
  while (!isAfter(d, oggi)) {
    count++;
    d = addMonths(d, passo);
  }
  return count;
}

// importo maturato sul conto (base cassa)
export function maturato(v: VoceCalc, oggi: Date): number {
  return occorrenzeMaturate(v, oggi) * v.importo;
}

// prossima scadenza futura (null per ONE_SHOT passato)
export function prossimoRinnovo(v: VoceCalc, oggi: Date): Date | null {
  const passo = passoMesi(v.periodo);
  if (passo === null) return isAfter(v.dataInizio, oggi) ? v.dataInizio : null;
  let d = v.dataInizio;
  while (!isAfter(d, oggi)) d = addMonths(d, passo);
  return d;
}

// saldo conto = iniziale + entrate maturate - uscite maturate
export function saldoConto(saldoIniziale: number, voci: VoceCalc[], oggi: Date): number {
  return voci.reduce((s, v) => {
    const m = maturato(v, oggi);
    return v.tipo === "ENTRATA" ? s + m : s - m;
  }, saldoIniziale);
}