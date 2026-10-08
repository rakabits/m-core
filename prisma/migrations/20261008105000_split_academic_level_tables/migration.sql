-- CreateTable
CREATE TABLE "junior_high_classes" (
    "junior_high_class_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "grade" INTEGER NOT NULL,
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "junior_high_classes_pkey" PRIMARY KEY ("junior_high_class_id")
);
CREATE TABLE "senior_high_classes" (
    "senior_high_class_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "grade" INTEGER NOT NULL,
    "specialization" VARCHAR(100),
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "senior_high_classes_pkey" PRIMARY KEY ("senior_high_class_id")
);
CREATE TABLE "pre_university_programs" (
    "pre_university_program_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "destination" VARCHAR(100),
    "capacity" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "pre_university_programs_pkey" PRIMARY KEY ("pre_university_program_id")
);
CREATE UNIQUE INDEX "uq_junior_high_class_context" ON "junior_high_classes"("academic_year_id", "program_id", "code");
CREATE INDEX "junior_high_classes_program_id_idx" ON "junior_high_classes"("program_id");
CREATE INDEX "junior_high_classes_academic_year_id_idx" ON "junior_high_classes"("academic_year_id");
CREATE UNIQUE INDEX "uq_senior_high_class_context" ON "senior_high_classes"("academic_year_id", "program_id", "code");
CREATE INDEX "senior_high_classes_program_id_idx" ON "senior_high_classes"("program_id");
CREATE INDEX "senior_high_classes_academic_year_id_idx" ON "senior_high_classes"("academic_year_id");
CREATE UNIQUE INDEX "uq_pre_university_program_context" ON "pre_university_programs"("academic_year_id", "program_id", "code");
CREATE INDEX "pre_university_programs_program_id_idx" ON "pre_university_programs"("program_id");
CREATE INDEX "pre_university_programs_academic_year_id_idx" ON "pre_university_programs"("academic_year_id");
ALTER TABLE "junior_high_classes" ADD CONSTRAINT "junior_high_classes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "junior_high_classes" ADD CONSTRAINT "junior_high_classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "senior_high_classes" ADD CONSTRAINT "senior_high_classes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "senior_high_classes" ADD CONSTRAINT "senior_high_classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pre_university_programs" ADD CONSTRAINT "pre_university_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pre_university_programs" ADD CONSTRAINT "pre_university_programs_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;
