ALTER TABLE "applicants"
  ADD COLUMN IF NOT EXISTS "public_token" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "enrollment_period_id" TEXT,
  ADD COLUMN IF NOT EXISTS "student_id" TEXT;

ALTER TABLE "applicants"
  ALTER COLUMN "full_name" DROP NOT NULL,
  ALTER COLUMN "gender" DROP NOT NULL,
  ALTER COLUMN "birth_place" DROP NOT NULL,
  ALTER COLUMN "birth_date" DROP NOT NULL,
  ALTER COLUMN "national_id" DROP NOT NULL,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "student_phone" DROP NOT NULL,
  ALTER COLUMN "student_whatsapp" DROP NOT NULL,
  ALTER COLUMN "parent_phone" DROP NOT NULL,
  ALTER COLUMN "payment_method" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "applicants_public_token_key" ON "applicants"("public_token");
CREATE INDEX IF NOT EXISTS "applicants_enrollment_period_id_idx" ON "applicants"("enrollment_period_id");
CREATE INDEX IF NOT EXISTS "applicants_student_id_idx" ON "applicants"("student_id");

DO $$ BEGIN
  ALTER TABLE "applicants" ADD CONSTRAINT "applicants_enrollment_period_id_fkey" FOREIGN KEY ("enrollment_period_id") REFERENCES "enrollment_periods"("enrollment_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "applicants" ADD CONSTRAINT "applicants_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;