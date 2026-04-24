-- CreateTable: customer_menu_categories (no FK deps, create first)
CREATE TABLE IF NOT EXISTS "customer_menu_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_hi" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "enabled_routes" JSONB NOT NULL DEFAULT '[]',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "customer_menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: customer_users
CREATE TABLE IF NOT EXISTS "customer_users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "linked_entity_type" TEXT NOT NULL,
    "linked_entity_id" TEXT NOT NULL,
    "linked_entity_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "company_name" TEXT,
    "gstin" TEXT,
    "menu_category_id" TEXT,
    "page_overrides" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "refresh_token" TEXT,
    "refresh_token_exp" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_exp" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "customer_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: customer_portal_logs
CREATE TABLE IF NOT EXISTS "customer_portal_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "route" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_portal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customer_menu_categories_tenant_id_name_key" ON "customer_menu_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_menu_categories_tenant_id_idx" ON "customer_menu_categories"("tenant_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customer_users_tenant_id_email_key" ON "customer_users"("tenant_id", "email");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customer_users_tenant_id_linked_entity_type_linked_entity_id_key" ON "customer_users"("tenant_id", "linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_users_tenant_id_idx" ON "customer_users"("tenant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_users_tenant_id_is_active_idx" ON "customer_users"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_portal_logs_tenant_id_customer_user_id_idx" ON "customer_portal_logs"("tenant_id", "customer_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_portal_logs_tenant_id_created_at_idx" ON "customer_portal_logs"("tenant_id", "created_at");

-- AddForeignKey
ALTER TABLE "customer_users" ADD CONSTRAINT "customer_users_menu_category_id_fkey"
    FOREIGN KEY ("menu_category_id") REFERENCES "customer_menu_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
