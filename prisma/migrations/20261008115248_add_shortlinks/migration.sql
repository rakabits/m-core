/*
  Warnings:

  - Made the column `public_token` on table `applicants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enrollment_period_id` on table `applicants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "applicants" ALTER COLUMN "public_token" SET NOT NULL,
ALTER COLUMN "enrollment_period_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "Shortlink" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shortlink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shortlink_code_key" ON "Shortlink"("code");

-- CreateIndex
CREATE INDEX "Shortlink_createdAt_idx" ON "Shortlink"("createdAt");

-- RenameIndex
ALTER INDEX "uq_junior_high_class_context" RENAME TO "junior_high_classes_academic_year_id_program_id_code_key";

-- RenameIndex
ALTER INDEX "uq_pre_university_program_context" RENAME TO "pre_university_programs_academic_year_id_program_id_code_key";

-- RenameIndex
ALTER INDEX "uq_senior_high_class_context" RENAME TO "senior_high_classes_academic_year_id_program_id_code_key";
