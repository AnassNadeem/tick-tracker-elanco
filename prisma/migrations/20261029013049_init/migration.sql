-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latinName" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "identificationTips" TEXT NOT NULL,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "upstreamId" TEXT,
    "speciesId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "severity" TEXT,
    "observedAt" DATETIME NOT NULL,
    "locationLabel" TEXT,
    "lat" REAL,
    "lng" REAL,
    "reporterNote" TEXT,
    "imageUrl" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sighting_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sighting_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Species_slug_key" ON "Species"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Sighting_upstreamId_key" ON "Sighting"("upstreamId");

-- CreateIndex
CREATE INDEX "Sighting_observedAt_regionId_idx" ON "Sighting"("observedAt", "regionId");

-- CreateIndex
CREATE INDEX "Sighting_speciesId_idx" ON "Sighting"("speciesId");

-- CreateIndex
CREATE INDEX "Sighting_severity_idx" ON "Sighting"("severity");
