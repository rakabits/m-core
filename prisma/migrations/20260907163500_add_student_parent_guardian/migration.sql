-- CreateEnum
CREATE TYPE "ParentRole" AS ENUM ('father', 'mother', 'other');

-- CreateEnum
CREATE TYPE "GuardianSource" AS ENUM ('father', 'mother', 'other');

-- CreateTable
CREATE TABLE "student_parents" (
    "parent_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "role" "ParentRole" NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "nik" VARCHAR(16),
    "phone" VARCHAR(20),
    "education" VARCHAR(100),
    "education_other" VARCHAR(100),
    "occupation" VARCHAR(100),
    "occupation_other" VARCHAR(100),
    "monthly_income" INTEGER,
    "relationship" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("parent_id")
);

-- CreateTable
CREATE TABLE "student_guardians" (
    "guardian_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "guardian_is_different" BOOLEAN NOT NULL DEFAULT false,
    "guardian_source" "GuardianSource" NOT NULL DEFAULT 'father',
    "other_parent_id" TEXT,

    CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("guardian_id")
);

-- CreateIndex
CREATE INDEX "student_parents_student_id_idx" ON "student_parents"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_parents_student_id_role_key" ON "student_parents"("student_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardians_student_id_key" ON "student_guardians"("student_id");

-- CreateIndex
CREATE INDEX "student_guardians_other_parent_id_idx" ON "student_guardians"("other_parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nik_key" ON "students"("nik");

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardians" ADD CONSTRAINT "student_guardians_other_parent_id_fkey" FOREIGN KEY ("other_parent_id") REFERENCES "student_parents"("parent_id") ON DELETE SET NULL ON UPDATE CASCADE;

