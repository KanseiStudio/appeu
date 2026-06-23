-- CreateEnum
CREATE TYPE "Area" AS ENUM ('LAVORO', 'CASA');

-- CreateEnum
CREATE TYPE "Tipo" AS ENUM ('ENTRATA', 'USCITA');

-- CreateEnum
CREATE TYPE "Periodo" AS ENUM ('ONE_SHOT', 'MENSILE', 'BIMESTRALE', 'ANNUALE');

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "area" "Area" NOT NULL,
    "tipo" "Tipo" NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voce" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "importo" DECIMAL(12,2) NOT NULL,
    "periodo" "Periodo" NOT NULL,
    "dataInizio" TIMESTAMP(3) NOT NULL,
    "prossimoRinnovo" TIMESTAMP(3),
    "rinnovoAutomatico" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Impostazioni" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "pinHash" TEXT NOT NULL,
    "saldoIniziale" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dataAttivazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Impostazioni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE INDEX "Voce_categoriaId_idx" ON "Voce"("categoriaId");

-- AddForeignKey
ALTER TABLE "Voce" ADD CONSTRAINT "Voce_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
