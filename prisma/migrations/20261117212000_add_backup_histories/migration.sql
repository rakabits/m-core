CREATE TYPE "BackupStatus" AS ENUM ('pending', 'running', 'success', 'failed');

CREATE TABLE "backup_histories" (
    "backup_id" TEXT NOT NULL,
    "period" VARCHAR(7) NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'pending',
    "total_students" INTEGER,
    "spreadsheet_name" VARCHAR(255),
    "spreadsheet_url" VARCHAR(1000),
    "error_message" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "backup_histories_pkey" PRIMARY KEY ("backup_id")
);

CREATE UNIQUE INDEX "backup_histories_period_key" ON "backup_histories"("period");
CREATE INDEX "backup_histories_status_idx" ON "backup_histories"("status");
CREATE INDEX "backup_histories_created_at_idx" ON "backup_histories"("created_at");