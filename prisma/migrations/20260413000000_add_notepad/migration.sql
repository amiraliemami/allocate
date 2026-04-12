-- CreateTable
CREATE TABLE "notepad" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notepad_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton row
INSERT INTO "notepad" ("id", "content", "updatedAt")
VALUES ('singleton', '', NOW())
ON CONFLICT ("id") DO NOTHING;
