-- Add public numeric Student ID while preserving the UUID primary key.
CREATE SEQUENCE "students_student_number_seq";
ALTER TABLE "students" ADD COLUMN "student_number" INTEGER;
WITH numbered_students AS (
  SELECT "student_id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC, "student_id" ASC)::INTEGER AS number
  FROM "students"
)
UPDATE "students" AS s SET "student_number" = numbered_students.number FROM numbered_students WHERE s."student_id" = numbered_students."student_id";
SELECT setval('students_student_number_seq', COALESCE((SELECT MAX("student_number") FROM "students"), 0), true);
ALTER TABLE "students" ALTER COLUMN "student_number" SET DEFAULT nextval('students_student_number_seq'), ALTER COLUMN "student_number" SET NOT NULL;
ALTER SEQUENCE "students_student_number_seq" OWNED BY "students"."student_number";
CREATE UNIQUE INDEX "students_student_number_key" ON "students"("student_number");
