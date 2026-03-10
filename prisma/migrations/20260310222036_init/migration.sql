-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Destinazione" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "trasporto" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Imballo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "famiglia" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "costo" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Pallet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codice" TEXT NOT NULL,
    "costo" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Quotazione" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente" TEXT NOT NULL,
    "prodotto" TEXT NOT NULL,
    "lotto" TEXT NOT NULL,
    "destinazione" TEXT NOT NULL,
    "prezzo" REAL NOT NULL,
    "costo" REAL NOT NULL,
    "utile" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nome_key" ON "Cliente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Destinazione_nome_key" ON "Destinazione"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Pallet_codice_key" ON "Pallet"("codice");
