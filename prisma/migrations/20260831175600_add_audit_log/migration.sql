-- CreateTable
CREATE TABLE "audit_logs" (
    "audit_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" VARCHAR(80) NOT NULL,
    "resource" VARCHAR(80) NOT NULL,
    "resource_id" VARCHAR(100),
    "changes" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("audit_id")
);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_profiles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
