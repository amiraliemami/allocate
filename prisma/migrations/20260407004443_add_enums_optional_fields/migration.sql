-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BillingRate" ADD VALUE 'CoImpact';
ALTER TYPE "BillingRate" ADD VALUE 'Standard';

-- AlterEnum
ALTER TYPE "Pillar" ADD VALUE 'Internal';

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "pillar" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "billingRate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "teammates" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "level" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;
