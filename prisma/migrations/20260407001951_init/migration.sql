-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DS', 'DE', 'FSE', 'PM');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('I', 'II', 'III', 'IV', 'Chief');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('Global', 'IND', 'WNA', 'ESA');

-- CreateEnum
CREATE TYPE "TeammateStatus" AS ENUM ('Active', 'Alumni');

-- CreateEnum
CREATE TYPE "Pillar" AS ENUM ('Products', 'Services', 'Advisory');

-- CreateEnum
CREATE TYPE "BillingRate" AS ENUM ('Internal', 'L1', 'Fractional');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Pipeline', 'Active', 'Inactive', 'Archive', 'Completed');

-- CreateTable
CREATE TABLE "teammates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "level" "Level" NOT NULL,
    "region" "Region" NOT NULL,
    "status" "TeammateStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teammates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pillar" "Pillar" NOT NULL,
    "region" "Region" NOT NULL,
    "billingRate" "BillingRate" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'Pipeline',
    "conversionProbability" INTEGER,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "teammateId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "fraction" INTEGER NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teammates_email_key" ON "teammates"("email");

-- CreateIndex
CREATE INDEX "teammates_status_idx" ON "teammates"("status");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_leadId_idx" ON "projects"("leadId");

-- CreateIndex
CREATE INDEX "allocations_teammateId_idx" ON "allocations"("teammateId");

-- CreateIndex
CREATE INDEX "allocations_projectId_idx" ON "allocations"("projectId");

-- CreateIndex
CREATE INDEX "allocations_weekStart_idx" ON "allocations"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "allocations_teammateId_projectId_weekStart_key" ON "allocations"("teammateId", "projectId", "weekStart");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "teammates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_teammateId_fkey" FOREIGN KEY ("teammateId") REFERENCES "teammates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
