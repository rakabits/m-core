-- CreateEnum
CREATE TYPE "AcademicLevel" AS ENUM ('JUNIOR_HIGH', 'SENIOR_HIGH', 'PRE_UNIVERSITY');

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "academic_level" "AcademicLevel";

-- CreateTable
CREATE TABLE "pre_university_countries" (
    "country_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_university_countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "academic_master_histories" (
    "history_id" TEXT NOT NULL,
    "academic_level" "AcademicLevel" NOT NULL,
    "academic_year_id" TEXT,
    "snapshot" JSONB NOT NULL,
    "actor_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_master_histories_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_university_countries_name_key" ON "pre_university_countries"("name");

-- CreateIndex
CREATE INDEX "pre_university_countries_is_active_idx" ON "pre_university_countries"("is_active");

-- CreateIndex
CREATE INDEX "academic_master_histories_academic_level_created_at_idx" ON "academic_master_histories"("academic_level", "created_at");

-- CreateIndex
CREATE INDEX "academic_master_histories_academic_year_id_idx" ON "academic_master_histories"("academic_year_id");

-- CreateIndex
CREATE INDEX "programs_academic_level_idx" ON "programs"("academic_level");

-- AddForeignKey
ALTER TABLE "academic_master_histories" ADD CONSTRAINT "academic_master_histories_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("academic_year_id") ON DELETE SET NULL ON UPDATE CASCADE;
