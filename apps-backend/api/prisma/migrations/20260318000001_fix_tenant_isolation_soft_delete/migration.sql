-- CF-1: Tenant Isolation Fix
-- Date: 2026-03-18
-- Fixes: 10 finance line-item models missing tenantId
--        28 models missing @@index([tenantId])
--        23 business models missing soft delete fields

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Add tenantId to finance line-item models
-- NOTE: Set tenantId from parent record on existing data
-- ══════════════════════════════════════════════════════════════

-- SaleOrderItem
ALTER TABLE "sale_order_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "sale_order_items" soi
  SET "tenant_id" = so."tenant_id"
  FROM "sale_orders" so WHERE soi."sale_order_id" = so."id";
ALTER TABLE "sale_order_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- SaleReturnItem
ALTER TABLE "sale_return_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "sale_return_items" sri
  SET "tenant_id" = sr."tenant_id"
  FROM "sale_returns" sr WHERE sri."return_id" = sr."id";
ALTER TABLE "sale_return_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- PurchaseInvoiceItem
ALTER TABLE "purchase_invoice_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "purchase_invoice_items" pii
  SET "tenant_id" = pi."tenant_id"
  FROM "purchase_invoices" pi WHERE pii."invoice_id" = pi."id";
ALTER TABLE "purchase_invoice_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- PurchaseOrderItem
ALTER TABLE "purchase_order_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "purchase_order_items" poi
  SET "tenant_id" = po."tenant_id"
  FROM "purchase_orders" po WHERE poi."po_id" = po."id";
ALTER TABLE "purchase_order_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- PurchaseQuotationItem
ALTER TABLE "purchase_quotation_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "purchase_quotation_items" pqi
  SET "tenant_id" = pq."tenant_id"
  FROM "purchase_quotations" pq WHERE pqi."quotation_id" = pq."id";
ALTER TABLE "purchase_quotation_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- PurchaseRFQItem
ALTER TABLE "purchase_rfq_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "purchase_rfq_items" pri
  SET "tenant_id" = prfq."tenant_id"
  FROM "purchase_rfqs" prfq WHERE pri."rfq_id" = prfq."id";
ALTER TABLE "purchase_rfq_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- GoodsReceiptItem
ALTER TABLE "goods_receipt_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "goods_receipt_items" gri
  SET "tenant_id" = gr."tenant_id"
  FROM "goods_receipts" gr WHERE gri."receipt_id" = gr."id";
ALTER TABLE "goods_receipt_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- DebitNoteItem
ALTER TABLE "debit_note_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "debit_note_items" dni
  SET "tenant_id" = dn."tenant_id"
  FROM "debit_notes" dn WHERE dni."debit_note_id" = dn."id";
ALTER TABLE "debit_note_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- DeliveryChallanItem (no @@map — use delivery_challan_items)
ALTER TABLE "delivery_challan_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "delivery_challan_items" dci
  SET "tenant_id" = dc."tenant_id"
  FROM "delivery_challans" dc WHERE dci."challan_id" = dc."id";
ALTER TABLE "delivery_challan_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- BOMFormulaItem
ALTER TABLE "bom_formula_items" ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;
UPDATE "bom_formula_items" bfi
  SET "tenant_id" = bf."tenant_id"
  FROM "bom_formulas" bf WHERE bfi."formula_id" = bf."id";
ALTER TABLE "bom_formula_items" ALTER COLUMN "tenant_id" SET NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- STEP 2: Add indexes for tenantId on new line-item models
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "sale_order_items_tenant_id_idx" ON "sale_order_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "sale_return_items_tenant_id_idx" ON "sale_return_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "purchase_invoice_items_tenant_id_idx" ON "purchase_invoice_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "purchase_order_items_tenant_id_idx" ON "purchase_order_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "purchase_quotation_items_tenant_id_idx" ON "purchase_quotation_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "purchase_rfq_items_tenant_id_idx" ON "purchase_rfq_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "goods_receipt_items_tenant_id_idx" ON "goods_receipt_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "debit_note_items_tenant_id_idx" ON "debit_note_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "delivery_challan_items_tenant_id_idx" ON "delivery_challan_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "bom_formula_items_tenant_id_idx" ON "bom_formula_items"("tenant_id");

-- ══════════════════════════════════════════════════════════════
-- STEP 3: Add missing @@index([tenantId]) to 28 existing models
-- (models already had tenantId but were missing the index)
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "permission_templates_tenant_id_idx" ON "permission_templates"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_usage_tenant_id_idx" ON "tenant_usage"("tenant_id");
CREATE INDEX IF NOT EXISTS "cron_job_run_logs_tenant_id_idx" ON "cron_job_run_logs"("tenant_id");
CREATE INDEX IF NOT EXISTS "error_auto_report_rules_tenant_id_idx" ON "error_auto_report_rules"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_brandings_tenant_id_idx" ON "tenant_brandings"("tenant_id");
CREATE INDEX IF NOT EXISTS "business_hours_schedules_tenant_id_idx" ON "business_hours_schedules"("tenant_id");
CREATE INDEX IF NOT EXISTS "auto_number_sequences_tenant_id_idx" ON "auto_number_sequences"("tenant_id");
CREATE INDEX IF NOT EXISTS "company_profiles_tenant_id_idx" ON "company_profiles"("tenant_id");
CREATE INDEX IF NOT EXISTS "security_policies_tenant_id_idx" ON "security_policies"("tenant_id");
CREATE INDEX IF NOT EXISTS "data_retention_policies_tenant_id_idx" ON "data_retention_policies"("tenant_id");
CREATE INDEX IF NOT EXISTS "notion_configs_tenant_id_idx" ON "notion_configs"("tenant_id");
CREATE INDEX IF NOT EXISTS "ai_settings_tenant_id_idx" ON "ai_settings"("tenant_id");
CREATE INDEX IF NOT EXISTS "wallets_tenant_id_idx" ON "wallets"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_profiles_tenant_id_idx" ON "tenant_profiles"("tenant_id");
CREATE INDEX IF NOT EXISTS "marketplace_reviews_tenant_id_idx" ON "marketplace_reviews"("tenant_id");
CREATE INDEX IF NOT EXISTS "verification_otps_tenant_id_idx" ON "verification_otps"("tenant_id");
CREATE INDEX IF NOT EXISTS "post_comments_tenant_id_idx" ON "post_comments"("tenant_id");
CREATE INDEX IF NOT EXISTS "document_templates_tenant_id_idx" ON "document_templates"("tenant_id");
CREATE INDEX IF NOT EXISTS "stock_locations_tenant_id_idx" ON "stock_locations"("tenant_id");
CREATE INDEX IF NOT EXISTS "bom_formulas_tenant_id_idx" ON "bom_formulas"("tenant_id");
CREATE INDEX IF NOT EXISTS "bom_productions_tenant_id_idx" ON "bom_productions"("tenant_id");
CREATE INDEX IF NOT EXISTS "quotation_comparisons_tenant_id_idx" ON "quotation_comparisons"("tenant_id");
CREATE INDEX IF NOT EXISTS "shortcut_user_overrides_tenant_id_idx" ON "shortcut_user_overrides"("tenant_id");
CREATE INDEX IF NOT EXISTS "warranty_templates_tenant_id_idx" ON "warranty_templates"("tenant_id");
CREATE INDEX IF NOT EXISTS "amc_plan_templates_tenant_id_idx" ON "amc_plan_templates"("tenant_id");
CREATE INDEX IF NOT EXISTS "service_charges_tenant_id_idx" ON "service_charges"("tenant_id");
CREATE INDEX IF NOT EXISTS "ai_chat_messages_tenant_id_idx" ON "ai_chat_messages"("tenant_id");
CREATE INDEX IF NOT EXISTS "tenant_rule_cache_versions_tenant_id_idx" ON "tenant_rule_cache_versions"("tenant_id");

-- ══════════════════════════════════════════════════════════════
-- STEP 4: Add soft delete fields to 23 priority business models
-- ══════════════════════════════════════════════════════════════
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "proforma_invoices" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "proforma_invoices" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "sale_masters" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sale_masters" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "purchase_invoices" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "purchase_invoices" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "sale_returns" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sale_returns" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "delivery_challans" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "delivery_challans" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "goods_receipts" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "goods_receipts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "debit_notes" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "debit_notes" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "credit_notes" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "credit_notes" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "purchase_quotations" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "purchase_quotations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "purchase_rfqs" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "purchase_rfqs" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "sale_orders" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sale_orders" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "amc_contracts" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "amc_contracts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "warranty_records" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "warranty_records" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "warranty_claims" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "warranty_claims" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "service_visit_logs" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "service_visit_logs" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "payment_receipts" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "payment_receipts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "account_groups" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "account_groups" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "account_transactions" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "account_transactions" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bank_accounts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
