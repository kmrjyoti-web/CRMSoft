-- CreateTable
CREATE TABLE "table_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "table_key" TEXT NOT NULL,
    "user_id" TEXT,
    "config" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_masking_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "table_key" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "role_id" TEXT,
    "user_id" TEXT,
    "mask_type" TEXT NOT NULL DEFAULT 'FULL',
    "can_unmask" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_masking_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unmask_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL,
    "table_key" TEXT NOT NULL,
    "column_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "unmasked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unmask_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "table_configs_tenant_id_table_key_idx" ON "table_configs"("tenant_id", "table_key");

-- CreateIndex
CREATE UNIQUE INDEX "table_configs_tenant_id_table_key_user_id_key" ON "table_configs"("tenant_id", "table_key", "user_id");

-- CreateIndex
CREATE INDEX "data_masking_policies_tenant_id_table_key_idx" ON "data_masking_policies"("tenant_id", "table_key");

-- CreateIndex
CREATE INDEX "unmask_audit_logs_tenant_id_user_id_idx" ON "unmask_audit_logs"("tenant_id", "user_id");

-- AddForeignKey
ALTER TABLE "table_configs" ADD CONSTRAINT "table_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_masking_policies" ADD CONSTRAINT "data_masking_policies_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_masking_policies" ADD CONSTRAINT "data_masking_policies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unmask_audit_logs" ADD CONSTRAINT "unmask_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
