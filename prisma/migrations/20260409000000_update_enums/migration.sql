-- Region: add SEA
ALTER TYPE "Region" ADD VALUE 'SEA';

-- Level: add Intern and AD, rename Chief → Director
ALTER TYPE "Level" ADD VALUE 'Intern';
ALTER TYPE "Level" ADD VALUE 'AD';
ALTER TYPE "Level" RENAME VALUE 'Chief' TO 'Director';

-- Pillar: rename Internal → Admin
ALTER TYPE "Pillar" RENAME VALUE 'Internal' TO 'Admin';

-- ProjectStatus: rename Pipeline→Upcoming, Inactive→Paused, Archive→Archived
ALTER TYPE "ProjectStatus" RENAME VALUE 'Pipeline' TO 'Upcoming';
ALTER TYPE "ProjectStatus" RENAME VALUE 'Inactive' TO 'Paused';
ALTER TYPE "ProjectStatus" RENAME VALUE 'Archive' TO 'Archived';

-- Update default value for projects.status
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'Upcoming'::"ProjectStatus";
