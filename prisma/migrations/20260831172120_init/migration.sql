-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('active', 'alumni', 'inactive');

-- CreateEnum
CREATE TYPE "ProgramHistoryStatus" AS ENUM ('enrolled', 'completed', 'transferred', 'dropped', 'cancelled');

-- CreateTable
CREATE TABLE "students" (
    "student_id" TEXT NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_place" VARCHAR(100),
    "birth_date" DATE,
    "nik" VARCHAR(16),
    "email" VARCHAR(150),
    "phone" VARCHAR(20),
    "whatsapp" VARCHAR(20),
    "status" "StudentStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "programs" (
    "program_id" TEXT NOT NULL,
    "program_code" VARCHAR(50) NOT NULL,
    "program_name" VARCHAR(150) NOT NULL,
    "education_level" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "student_program_history" (
    "history_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_year" VARCHAR(9) NOT NULL,
    "level" VARCHAR(50),
    "class_name" VARCHAR(50),
    "status" "ProgramHistoryStatus" NOT NULL DEFAULT 'enrolled',
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_program_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE INDEX "students_full_name_idx" ON "students"("full_name");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_birth_date_idx" ON "students"("birth_date");

-- CreateIndex
CREATE UNIQUE INDEX "programs_program_code_key" ON "programs"("program_code");

-- CreateIndex
CREATE INDEX "programs_program_name_idx" ON "programs"("program_name");

-- CreateIndex
CREATE INDEX "programs_is_active_idx" ON "programs"("is_active");

-- CreateIndex
CREATE INDEX "student_program_history_student_id_idx" ON "student_program_history"("student_id");

-- CreateIndex
CREATE INDEX "student_program_history_program_id_idx" ON "student_program_history"("program_id");

-- CreateIndex
CREATE INDEX "student_program_history_academic_year_idx" ON "student_program_history"("academic_year");

-- CreateIndex
CREATE INDEX "student_program_history_status_idx" ON "student_program_history"("status");

-- CreateIndex
CREATE INDEX "student_program_history_student_id_academic_year_idx" ON "student_program_history"("student_id", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "student_program_history_student_id_program_id_academic_year_key" ON "student_program_history"("student_id", "program_id", "academic_year");

-- AddForeignKey
ALTER TABLE "student_program_history" ADD CONSTRAINT "student_program_history_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_program_history" ADD CONSTRAINT "student_program_history_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
