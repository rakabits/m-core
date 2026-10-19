CREATE TABLE "user_permission_grants" (
  "user_id" TEXT NOT NULL,
  "permission_id" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "user_permission_grants_pkey" PRIMARY KEY ("user_id", "permission_id"),
  CONSTRAINT "user_permission_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_permission_grants_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "user_permission_grants_permission_id_idx" ON "user_permission_grants"("permission_id");
