ALTER TABLE "programs" ADD COLUMN "academic_period" VARCHAR(9) NOT NULL DEFAULT '2025/2026';

CREATE INDEX "programs_academic_period_idx" ON "programs"("academic_period");