CREATE TABLE IF NOT EXISTS "academic_level_settings" (
  "academic_level_setting_id" TEXT NOT NULL,
  "academic_level" "AcademicLevel" NOT NULL,
  "academic_year_id" TEXT NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academic_level_settings_pkey" PRIMARY KEY ("academic_level_setting_id"),
  CONSTRAINT "academic_level_settings_academic_level_key" UNIQUE ("academic_level"),
  CONSTRAINT "academic_level_settings_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "academic_level_settings_academic_year_id_idx" ON "academic_level_settings"("academic_year_id");
