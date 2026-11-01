-- Add safe onboarding status for newly imported students.
ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'pending_review';

ALTER TABLE "students"
  ALTER COLUMN "status" SET DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS "alumni_destination_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "alumni_destination_name" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "alumni_destination_program" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "alumni_destination_city" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "alumni_destination_year" INTEGER;