# Spec — App Monitoraggio Conto (Hell/Paradise)

Web app **mobile-responsive** per monitorare entrate e uscite di un conto, divise tra **Lavoro** e **Casa**. Documento di riferimento per lo sviluppo con Claude Code.

---

## 1. Stack & decisioni

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Database:** Postgres su Supabase, accesso tramite Prisma ORM
- **Accesso:** PIN singolo utente (no Supabase Auth, no tabella utenti)
- **Deploy:** Vercel
- **Alert rinnovi:** solo in-app (nessun cron / email / push)
- **Gauge:** componente SVG custom (no librerie chart pesanti)

### Sicurezza
- Il client **non** contiene chiavi Supabase.
- Tutte le operazioni DB passano da **server actions / API route** lato server, con `SUPABASE_SERVICE_ROLE_KEY` (o `DATABASE_URL`) in env.
- `/login` accetta il PIN; se valido imposta un cookie di sessione firmato `httpOnly`.
- Un `middleware` protegge tutte le route tranne `/login` e `/setup`.

### Onboarding (primo avvio)
- Al primo avvio (nessuna riga `Impostazioni`): pagina `/setup` che chiede **PIN** e **somma iniziale** del conto.
- Salvati PIN e `saldoIniziale`, si crea la riga `Impostazioni` e si reindirizza alla home.

---

## 2. Modello dati (Prisma)

```prisma
enum Area    { LAVORO  CASA }
enum Tipo    { ENTRATA USCITA }
enum Periodo { ONE_SHOT MENSILE BIMESTRALE ANNUALE }

model Categoria {
  id    String @id @default(cuid())
  slug  String @unique
  nome  String
  area  Area
  tipo  Tipo
  voci  Voce[]
}

model Voce {
  id                String    @id @default(cuid())
  categoria         Categoria @relation(fields: [categoriaId], references: [id])
  categoriaId       String
  nome              String
  importo           Decimal   @db.Decimal(12, 2)
  periodo           Periodo
  dataInizio        DateTime
  prossimoRinnovo   DateTime?
  rinnovoAutomatico Boolean   @default(false)
  createdAt         DateTime  @default(now())
}

model Impostazioni {
  id              String   @id @default("singleton") // riga unica
  saldoIniziale   Decimal  @db.Decimal(12, 2) @default(0)
  dataAttivazione DateTime @default(now())            // da quando si calcola il maturato
}
```

Nota: il **tipo** (entrata/uscita) è a livello di categoria. Le categorie sono fisse e caricate via seed. `Impostazioni` è una singola riga creata in onboarding e contiene la **somma iniziale** (entrata principale del conto).

### Seed categorie

**Lavoro**
- `entrate-lavori` — Entrate lavori — ENTRATA
- `gestione-software` — Gestione Software — USCITA
- `gestione-utenze-sede` — Gestione Utenze sede — USCITA
- `gestione-affitti-sede` — Gestione Affitti sede — USCITA
- `gestione-materiale-hw` — Gestione Materiale hardware — USCITA
- `stipendi` — Stipendi — USCITA

**Casa**
- `casa-utenze` — Gestione Utenze — USCITA
- `casa-abbonamenti` — Gestione Abbonamenti — USCITA
- `casa-cibo` — Gestione Cibo e ristoranti — USCITA
- `casa-extra` — Gestione Extra — USCITA

---

## 3. Logica di business

### 3.1 Ammortamento per periodo
Contributo al mese corrente di una voce = `importo / mesiPeriodo`:

| Periodo     | mesiPeriodo | Contributo mensile |
|-------------|-------------|--------------------|
| ONE_SHOT    | 1           | importo intero, **solo** nel mese di `dataInizio` |
| MENSILE     | 1           | importo intero, ogni mese |
| BIMESTRALE  | 2           | importo / 2, ogni mese |
| ANNUALE     | 12          | importo / 12, ogni mese |

> Da confermare: "bimestrale" è interpretato come costo del periodo spalmato su 2 mesi. Se invece significa "spesa piena ogni 2 mesi", si cambia solo questa funzione.

### 3.2 Totali mensili
- `usciteMese` = somma contributi delle voci in categorie USCITA per il mese.
- `entrateMese` = somma contributi delle voci in categorie ENTRATA per il mese.
- Usati per i due riepiloghi sotto al gauge (con % vs mese precedente).

### 3.2bis Saldo conto & somma iniziale
- `saldoIniziale` = entrata principale inserita in onboarding.
- **Maturato (base cassa, per il saldo):** una voce incide sul saldo a ogni **data di rinnovo ≤ oggi**. Ricorrenti (mensile/bimestrale/annuale): si sottrae l'`importo` a ogni scadenza maturata, calcolata da `dataInizio`/`prossimoRinnovo` secondo il `periodo`. ONE_SHOT: importo pieno se `dataInizio ≤ oggi`.
- **Saldo conto** = `saldoIniziale + Σ entrate maturate − Σ uscite maturate` (cumulativo dall'attivazione a oggi).
- Nota: i **riepiloghi mensili** (i due box con la %) usano invece il contributo *ammortizzato* (§3.1) per essere confrontabili mese su mese; il **saldo** usa la base cassa qui sopra.
- **Gauge:** semicerchio 180°. Indica il **saldo conto**. Centro (0) = conto azzerato; destra = Paradise (saldo positivo); sinistra = Hell (saldo negativo / in rosso). Scala da definire in Fase 5 (proposta: `scala = max(saldoIniziale, |saldoConto|)`; angolo = `90 + (saldoConto/scala)*90`, clampato a [0,180]).

### 3.3 Variazione % vs mese precedente
- `var% = (valoreMeseCorrente − valoreMesePrecedente) / valoreMesePrecedente * 100` (gestire denominatore 0).
- Calcolata separatamente per uscite ed entrate, mostrata in home.

### 3.4 Alert rinnovo (in-app)
- `prossimoRinnovo` impostato manualmente o derivato da `dataInizio + periodo`.
- Se `0 ≤ (prossimoRinnovo − oggi) ≤ 3 giorni` → banner: "Prossimo pagamento: {nome} {importo}€ il {data}".
- Vale sia per rinnovi automatici che manuali.

---

## 4. Pagine & route

| Route               | Riferimento | Contenuto |
|---------------------|-------------|-----------|
| `/setup`            | —           | Primo avvio: imposta PIN + somma iniziale |
| `/login`            | —           | Input PIN |
| `/`                 | parte_1     | Gauge saldo conto (Hell/Paradise) + riepilogo uscite (sx, con %) ed entrate (dx, con %) + bottone "Analizza" + banner alert |
| `/analizza`         | parte_2     | Sezioni Lavoro e Casa; ogni categoria è un bottone → dettaglio |
| `/categoria/[slug]` | parte_3/4   | Form "Aggiungi voce" (nome, costo, periodo) + elenco voci + totale categoria |

CRUD voci tramite server actions.

---

## 5. Roadmap a fasi (gate dopo ognuna)

0. Decisioni & spec — **completata**
1. Scaffold: Next.js + TS + Tailwind + repo Git
2. Database & schema: Prisma + Supabase, migrazioni, seed categorie
3. Accesso & onboarding: `/setup` (PIN + somma iniziale) + `/login` + cookie di sessione + middleware
4. Layer dati/API: CRUD voci + funzioni aggregazione (ammortamento, totali mensili, % vs mese prec., **saldo conto cumulativo**)
5. Home: gauge SVG su **saldo conto** + riepiloghi con % + bottone Analizza
6. Pagina Lavoro/Casa: due sezioni, routing categorie
7. Pagina dettaglio categoria: form + elenco + totale
8. Alert rinnovi in-app: calcolo prossimo rinnovo + banner
9. Rifinitura: mobile, validazioni, stati vuoti, test
10. Deploy: Vercel + variabili ambiente

---

## 6. Variabili d'ambiente

```
DATABASE_URL=           # Supabase, connection pooler (runtime)
DIRECT_URL=             # Supabase, connessione diretta (migrazioni Prisma)
APP_PIN=                # PIN di accesso (o hash)
SESSION_SECRET=         # firma cookie di sessione
```
