-- Add academic year to each program record while preserving existing rows.
ALTER TABLE "programs" ADD COLUMN "academic_year" VARCHAR(9) NOT NULL DEFAULT '2025/2026';
DROP INDEX IF EXISTS "programs_program_code_key";
CREATE UNIQUE INDEX "programs_program_code_academic_year_key" ON "programs"("program_code", "academic_year");
CREATE INDEX "programs_academic_year_idx" ON "programs"("academic_year");
