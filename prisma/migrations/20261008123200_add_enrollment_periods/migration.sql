CREATE TYPE "EnrollmentPeriodStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');
CREATE TABLE "enrollment_periods" (
  "enrollment_period_id" TEXT NOT NULL,
  "program_id" TEXT NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "status" "EnrollmentPeriodStatus" NOT NULL DEFAULT 'DRAFT',
  "registration_fee" INTEGER NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'IDR',
  "starts_at" TIMESTAMPTZ NOT NULL,
  "ends_at" TIMESTAMPTZ NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "enrollment_periods_pkey" PRIMARY KEY ("enrollment_period_id"),
  CONSTRAINT "enrollment_periods_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "enrollment_periods_program_id_status_idx" ON "enrollment_periods"("program_id", "status");
CREATE INDEX "enrollment_periods_status_starts_at_ends_at_idx" ON "enrollment_periods"("status", "starts_at", "ends_at");
