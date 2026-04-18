-- Sprint A Rollback Script — 2026-04-13
-- Reverses: ALTER TABLE "<name>" RENAME TO "_deprecated_<name>"
-- Idempotent: each rename wrapped in DO block — safe to re-run if partially applied

-- ═══════════════════════════════════════════════════════
-- MARKETPLACEDB (148 tables) — run against MARKETPLACE_DATABASE_URL
-- ═══════════════════════════════════════════════════════

BEGIN;
SET lock_timeout = '5s';
SET statement_timeout = '60s';

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_account_transactions') THEN
    ALTER TABLE "_deprecated_account_transactions" RENAME TO "account_transactions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_chat_messages') THEN
    ALTER TABLE "_deprecated_ai_chat_messages" RENAME TO "ai_chat_messages";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_documents') THEN
    ALTER TABLE "_deprecated_ai_documents" RENAME TO "ai_documents";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_embeddings') THEN
    ALTER TABLE "_deprecated_ai_embeddings" RENAME TO "ai_embeddings";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_models') THEN
    ALTER TABLE "_deprecated_ai_models" RENAME TO "ai_models";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_settings') THEN
    ALTER TABLE "_deprecated_ai_settings" RENAME TO "ai_settings";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_training_jobs') THEN
    ALTER TABLE "_deprecated_ai_training_jobs" RENAME TO "ai_training_jobs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ai_usage_logs') THEN
    ALTER TABLE "_deprecated_ai_usage_logs" RENAME TO "ai_usage_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_amc_schedules') THEN
    ALTER TABLE "_deprecated_amc_schedules" RENAME TO "amc_schedules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_api_request_logs') THEN
    ALTER TABLE "_deprecated_api_request_logs" RENAME TO "api_request_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_approval_requests') THEN
    ALTER TABLE "_deprecated_approval_requests" RENAME TO "approval_requests";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_approval_rules') THEN
    ALTER TABLE "_deprecated_approval_rules" RENAME TO "approval_rules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_assignment_rules') THEN
    ALTER TABLE "_deprecated_assignment_rules" RENAME TO "assignment_rules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_bank_accounts') THEN
    ALTER TABLE "_deprecated_bank_accounts" RENAME TO "bank_accounts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_bank_reconciliations') THEN
    ALTER TABLE "_deprecated_bank_reconciliations" RENAME TO "bank_reconciliations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_blocked_slots') THEN
    ALTER TABLE "_deprecated_blocked_slots" RENAME TO "blocked_slots";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_bom_formula_items') THEN
    ALTER TABLE "_deprecated_bom_formula_items" RENAME TO "bom_formula_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_bom_productions') THEN
    ALTER TABLE "_deprecated_bom_productions" RENAME TO "bom_productions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_brand_contacts') THEN
    ALTER TABLE "_deprecated_brand_contacts" RENAME TO "brand_contacts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_brand_organizations') THEN
    ALTER TABLE "_deprecated_brand_organizations" RENAME TO "brand_organizations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_business_hours_schedules') THEN
    ALTER TABLE "_deprecated_business_hours_schedules" RENAME TO "business_hours_schedules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_calendar_configs') THEN
    ALTER TABLE "_deprecated_calendar_configs" RENAME TO "calendar_configs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_calendar_events') THEN
    ALTER TABLE "_deprecated_calendar_events" RENAME TO "calendar_events";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_calendar_highlights') THEN
    ALTER TABLE "_deprecated_calendar_highlights" RENAME TO "calendar_highlights";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_campaign_recipients') THEN
    ALTER TABLE "_deprecated_campaign_recipients" RENAME TO "campaign_recipients";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_cloud_connections') THEN
    ALTER TABLE "_deprecated_cloud_connections" RENAME TO "cloud_connections";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_communication_logs') THEN
    ALTER TABLE "_deprecated_communication_logs" RENAME TO "communication_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_company_pincodes') THEN
    ALTER TABLE "_deprecated_company_pincodes" RENAME TO "company_pincodes";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_company_profiles') THEN
    ALTER TABLE "_deprecated_company_profiles" RENAME TO "company_profiles";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_contact_organizations') THEN
    ALTER TABLE "_deprecated_contact_organizations" RENAME TO "contact_organizations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_control_room_audit_logs') THEN
    ALTER TABLE "_deprecated_control_room_audit_logs" RENAME TO "control_room_audit_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_control_room_drafts') THEN
    ALTER TABLE "_deprecated_control_room_drafts" RENAME TO "control_room_drafts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_control_room_values') THEN
    ALTER TABLE "_deprecated_control_room_values" RENAME TO "control_room_values";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_credit_notes') THEN
    ALTER TABLE "_deprecated_credit_notes" RENAME TO "credit_notes";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_customer_group_mappings') THEN
    ALTER TABLE "_deprecated_customer_group_mappings" RENAME TO "customer_group_mappings";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_data_masking_policies') THEN
    ALTER TABLE "_deprecated_data_masking_policies" RENAME TO "data_masking_policies";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_debit_note_items') THEN
    ALTER TABLE "_deprecated_debit_note_items" RENAME TO "debit_note_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_delivery_challan_items') THEN
    ALTER TABLE "_deprecated_delivery_challan_items" RENAME TO "delivery_challan_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_document_activities') THEN
    ALTER TABLE "_deprecated_document_activities" RENAME TO "document_activities";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_document_attachments') THEN
    ALTER TABLE "_deprecated_document_attachments" RENAME TO "document_attachments";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_document_share_links') THEN
    ALTER TABLE "_deprecated_document_share_links" RENAME TO "document_share_links";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_attachments') THEN
    ALTER TABLE "_deprecated_email_attachments" RENAME TO "email_attachments";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_footer_templates') THEN
    ALTER TABLE "_deprecated_email_footer_templates" RENAME TO "email_footer_templates";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_signatures') THEN
    ALTER TABLE "_deprecated_email_signatures" RENAME TO "email_signatures";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_templates') THEN
    ALTER TABLE "_deprecated_email_templates" RENAME TO "email_templates";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_tracking_events') THEN
    ALTER TABLE "_deprecated_email_tracking_events" RENAME TO "email_tracking_events";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_email_unsubscribes') THEN
    ALTER TABLE "_deprecated_email_unsubscribes" RENAME TO "email_unsubscribes";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_entity_config_values') THEN
    ALTER TABLE "_deprecated_entity_config_values" RENAME TO "entity_config_values";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_entity_owners') THEN
    ALTER TABLE "_deprecated_entity_owners" RENAME TO "entity_owners";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_entity_verification_records') THEN
    ALTER TABLE "_deprecated_entity_verification_records" RENAME TO "entity_verification_records";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_escalation_rules') THEN
    ALTER TABLE "_deprecated_escalation_rules" RENAME TO "escalation_rules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_event_history') THEN
    ALTER TABLE "_deprecated_event_history" RENAME TO "event_history";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_event_participants') THEN
    ALTER TABLE "_deprecated_event_participants" RENAME TO "event_participants";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_export_jobs') THEN
    ALTER TABLE "_deprecated_export_jobs" RENAME TO "export_jobs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_follow_ups') THEN
    ALTER TABLE "_deprecated_follow_ups" RENAME TO "follow_ups";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_goods_receipt_items') THEN
    ALTER TABLE "_deprecated_goods_receipt_items" RENAME TO "goods_receipt_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_google_connections') THEN
    ALTER TABLE "_deprecated_google_connections" RENAME TO "google_connections";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_gst_returns') THEN
    ALTER TABLE "_deprecated_gst_returns" RENAME TO "gst_returns";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_gst_verification_logs') THEN
    ALTER TABLE "_deprecated_gst_verification_logs" RENAME TO "gst_verification_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_holiday_calendars') THEN
    ALTER TABLE "_deprecated_holiday_calendars" RENAME TO "holiday_calendars";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_import_rows') THEN
    ALTER TABLE "_deprecated_import_rows" RENAME TO "import_rows";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_inventory_labels') THEN
    ALTER TABLE "_deprecated_inventory_labels" RENAME TO "inventory_labels";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_invoice_line_items') THEN
    ALTER TABLE "_deprecated_invoice_line_items" RENAME TO "invoice_line_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_lead_filters') THEN
    ALTER TABLE "_deprecated_lead_filters" RENAME TO "lead_filters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ledger_mappings') THEN
    ALTER TABLE "_deprecated_ledger_mappings" RENAME TO "ledger_mappings";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_manufacturer_contacts') THEN
    ALTER TABLE "_deprecated_manufacturer_contacts" RENAME TO "manufacturer_contacts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_manufacturer_organizations') THEN
    ALTER TABLE "_deprecated_manufacturer_organizations" RENAME TO "manufacturer_organizations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_notification_configs') THEN
    ALTER TABLE "_deprecated_notification_configs" RENAME TO "notification_configs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_notification_preferences') THEN
    ALTER TABLE "_deprecated_notification_preferences" RENAME TO "notification_preferences";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_notion_configs') THEN
    ALTER TABLE "_deprecated_notion_configs" RENAME TO "notion_configs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_organization_filters') THEN
    ALTER TABLE "_deprecated_organization_filters" RENAME TO "organization_filters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_organization_locations') THEN
    ALTER TABLE "_deprecated_organization_locations" RENAME TO "organization_locations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ownership_logs') THEN
    ALTER TABLE "_deprecated_ownership_logs" RENAME TO "ownership_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_payment_receipts') THEN
    ALTER TABLE "_deprecated_payment_receipts" RENAME TO "payment_receipts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_payment_records') THEN
    ALTER TABLE "_deprecated_payment_records" RENAME TO "payment_records";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_payment_reminders') THEN
    ALTER TABLE "_deprecated_payment_reminders" RENAME TO "payment_reminders";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_price_list_items') THEN
    ALTER TABLE "_deprecated_price_list_items" RENAME TO "price_list_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_product_filters') THEN
    ALTER TABLE "_deprecated_product_filters" RENAME TO "product_filters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_product_prices') THEN
    ALTER TABLE "_deprecated_product_prices" RENAME TO "product_prices";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_product_relations') THEN
    ALTER TABLE "_deprecated_product_relations" RENAME TO "product_relations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_product_tax_details') THEN
    ALTER TABLE "_deprecated_product_tax_details" RENAME TO "product_tax_details";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_product_unit_conversions') THEN
    ALTER TABLE "_deprecated_product_unit_conversions" RENAME TO "product_unit_conversions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_proforma_line_items') THEN
    ALTER TABLE "_deprecated_proforma_line_items" RENAME TO "proforma_line_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_purchase_invoice_items') THEN
    ALTER TABLE "_deprecated_purchase_invoice_items" RENAME TO "purchase_invoice_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_purchase_masters') THEN
    ALTER TABLE "_deprecated_purchase_masters" RENAME TO "purchase_masters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_purchase_order_items') THEN
    ALTER TABLE "_deprecated_purchase_order_items" RENAME TO "purchase_order_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_purchase_quotation_items') THEN
    ALTER TABLE "_deprecated_purchase_quotation_items" RENAME TO "purchase_quotation_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_purchase_rfq_items') THEN
    ALTER TABLE "_deprecated_purchase_rfq_items" RENAME TO "purchase_rfq_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_push_subscriptions') THEN
    ALTER TABLE "_deprecated_push_subscriptions" RENAME TO "push_subscriptions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quiet_hour_configs') THEN
    ALTER TABLE "_deprecated_quiet_hour_configs" RENAME TO "quiet_hour_configs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_activities') THEN
    ALTER TABLE "_deprecated_quotation_activities" RENAME TO "quotation_activities";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_comparisons') THEN
    ALTER TABLE "_deprecated_quotation_comparisons" RENAME TO "quotation_comparisons";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_line_items') THEN
    ALTER TABLE "_deprecated_quotation_line_items" RENAME TO "quotation_line_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_negotiation_logs') THEN
    ALTER TABLE "_deprecated_quotation_negotiation_logs" RENAME TO "quotation_negotiation_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_send_logs') THEN
    ALTER TABLE "_deprecated_quotation_send_logs" RENAME TO "quotation_send_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_quotation_templates') THEN
    ALTER TABLE "_deprecated_quotation_templates" RENAME TO "quotation_templates";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_rate_limit_tiers') THEN
    ALTER TABLE "_deprecated_rate_limit_tiers" RENAME TO "rate_limit_tiers";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_recurring_events') THEN
    ALTER TABLE "_deprecated_recurring_events" RENAME TO "recurring_events";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_report_bookmarks') THEN
    ALTER TABLE "_deprecated_report_bookmarks" RENAME TO "report_bookmarks";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_report_export_logs') THEN
    ALTER TABLE "_deprecated_report_export_logs" RENAME TO "report_export_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_report_templates') THEN
    ALTER TABLE "_deprecated_report_templates" RENAME TO "report_templates";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sale_masters') THEN
    ALTER TABLE "_deprecated_sale_masters" RENAME TO "sale_masters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sale_order_items') THEN
    ALTER TABLE "_deprecated_sale_order_items" RENAME TO "sale_order_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sale_return_items') THEN
    ALTER TABLE "_deprecated_sale_return_items" RENAME TO "sale_return_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sales_targets') THEN
    ALTER TABLE "_deprecated_sales_targets" RENAME TO "sales_targets";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_saved_filters') THEN
    ALTER TABLE "_deprecated_saved_filters" RENAME TO "saved_filters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_saved_formulas') THEN
    ALTER TABLE "_deprecated_saved_formulas" RENAME TO "saved_formulas";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_scheduled_reports') THEN
    ALTER TABLE "_deprecated_scheduled_reports" RENAME TO "scheduled_reports";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_scrap_records') THEN
    ALTER TABLE "_deprecated_scrap_records" RENAME TO "scrap_records";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_serial_masters') THEN
    ALTER TABLE "_deprecated_serial_masters" RENAME TO "serial_masters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_service_charges') THEN
    ALTER TABLE "_deprecated_service_charges" RENAME TO "service_charges";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_service_rates') THEN
    ALTER TABLE "_deprecated_service_rates" RENAME TO "service_rates";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_shortcut_user_overrides') THEN
    ALTER TABLE "_deprecated_shortcut_user_overrides" RENAME TO "shortcut_user_overrides";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_stock_adjustments') THEN
    ALTER TABLE "_deprecated_stock_adjustments" RENAME TO "stock_adjustments";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_stock_locations') THEN
    ALTER TABLE "_deprecated_stock_locations" RENAME TO "stock_locations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_stock_summaries') THEN
    ALTER TABLE "_deprecated_stock_summaries" RENAME TO "stock_summaries";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_stock_transactions') THEN
    ALTER TABLE "_deprecated_stock_transactions" RENAME TO "stock_transactions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_support_ticket_messages') THEN
    ALTER TABLE "_deprecated_support_ticket_messages" RENAME TO "support_ticket_messages";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_audit_logs') THEN
    ALTER TABLE "_deprecated_sync_audit_logs" RENAME TO "sync_audit_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_change_logs') THEN
    ALTER TABLE "_deprecated_sync_change_logs" RENAME TO "sync_change_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_conflicts') THEN
    ALTER TABLE "_deprecated_sync_conflicts" RENAME TO "sync_conflicts";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_devices') THEN
    ALTER TABLE "_deprecated_sync_devices" RENAME TO "sync_devices";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_flush_commands') THEN
    ALTER TABLE "_deprecated_sync_flush_commands" RENAME TO "sync_flush_commands";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_sync_warning_rules') THEN
    ALTER TABLE "_deprecated_sync_warning_rules" RENAME TO "sync_warning_rules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_table_configs') THEN
    ALTER TABLE "_deprecated_table_configs" RENAME TO "table_configs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_task_history') THEN
    ALTER TABLE "_deprecated_task_history" RENAME TO "task_history";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_task_watchers') THEN
    ALTER TABLE "_deprecated_task_watchers" RENAME TO "task_watchers";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tds_records') THEN
    ALTER TABLE "_deprecated_tds_records" RENAME TO "tds_records";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_rule_cache_versions') THEN
    ALTER TABLE "_deprecated_tenant_rule_cache_versions" RENAME TO "tenant_rule_cache_versions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_template_customizations') THEN
    ALTER TABLE "_deprecated_tenant_template_customizations" RENAME TO "tenant_template_customizations";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tour_plan_photos') THEN
    ALTER TABLE "_deprecated_tour_plan_photos" RENAME TO "tour_plan_photos";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_unit_conversions') THEN
    ALTER TABLE "_deprecated_unit_conversions" RENAME TO "unit_conversions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_unit_masters') THEN
    ALTER TABLE "_deprecated_unit_masters" RENAME TO "unit_masters";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_unmask_audit_logs') THEN
    ALTER TABLE "_deprecated_unmask_audit_logs" RENAME TO "unmask_audit_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_user_availability') THEN
    ALTER TABLE "_deprecated_user_availability" RENAME TO "user_availability";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_user_calendar_syncs') THEN
    ALTER TABLE "_deprecated_user_calendar_syncs" RENAME TO "user_calendar_syncs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_verification_invites') THEN
    ALTER TABLE "_deprecated_verification_invites" RENAME TO "verification_invites";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wa_broadcast_recipients') THEN
    ALTER TABLE "_deprecated_wa_broadcast_recipients" RENAME TO "wa_broadcast_recipients";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wa_chatbot_flows') THEN
    ALTER TABLE "_deprecated_wa_chatbot_flows" RENAME TO "wa_chatbot_flows";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wa_messages') THEN
    ALTER TABLE "_deprecated_wa_messages" RENAME TO "wa_messages";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wa_opt_outs') THEN
    ALTER TABLE "_deprecated_wa_opt_outs" RENAME TO "wa_opt_outs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wa_quick_replies') THEN
    ALTER TABLE "_deprecated_wa_quick_replies" RENAME TO "wa_quick_replies";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_warranty_claims') THEN
    ALTER TABLE "_deprecated_warranty_claims" RENAME TO "warranty_claims";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_webhook_deliveries') THEN
    ALTER TABLE "_deprecated_webhook_deliveries" RENAME TO "webhook_deliveries";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_workflow_action_logs') THEN
    ALTER TABLE "_deprecated_workflow_action_logs" RENAME TO "workflow_action_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_workflow_approvals') THEN
    ALTER TABLE "_deprecated_workflow_approvals" RENAME TO "workflow_approvals";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_workflow_history') THEN
    ALTER TABLE "_deprecated_workflow_history" RENAME TO "workflow_history";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_workflow_sla_escalations') THEN
    ALTER TABLE "_deprecated_workflow_sla_escalations" RENAME TO "workflow_sla_escalations";
  END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════
-- WORKINGDB (44 tables) — run against GLOBAL_WORKING_DATABASE_URL
-- ═══════════════════════════════════════════════════════

BEGIN;
SET lock_timeout = '5s';
SET statement_timeout = '60s';

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_audit_field_changes') THEN
    ALTER TABLE "_deprecated_audit_field_changes" RENAME TO "audit_field_changes";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_audit_retention_policies') THEN
    ALTER TABLE "_deprecated_audit_retention_policies" RENAME TO "audit_retention_policies";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_bank_branches') THEN
    ALTER TABLE "_deprecated_bank_branches" RENAME TO "bank_branches";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_coupon_redemptions') THEN
    ALTER TABLE "_deprecated_coupon_redemptions" RENAME TO "coupon_redemptions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_credential_access_logs') THEN
    ALTER TABLE "_deprecated_credential_access_logs" RENAME TO "credential_access_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_data_retention_policies') THEN
    ALTER TABLE "_deprecated_data_retention_policies" RENAME TO "data_retention_policies";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_delegation_records') THEN
    ALTER TABLE "_deprecated_delegation_records" RENAME TO "delegation_records";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_error_catalog') THEN
    ALTER TABLE "_deprecated_error_catalog" RENAME TO "error_catalog";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_global_default_credentials') THEN
    ALTER TABLE "_deprecated_global_default_credentials" RENAME TO "global_default_credentials";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_global_lookups') THEN
    ALTER TABLE "_deprecated_global_lookups" RENAME TO "global_lookups";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_help_articles') THEN
    ALTER TABLE "_deprecated_help_articles" RENAME TO "help_articles";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_hsn_sac_codes') THEN
    ALTER TABLE "_deprecated_hsn_sac_codes" RENAME TO "hsn_sac_codes";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_industry_packages') THEN
    ALTER TABLE "_deprecated_industry_packages" RENAME TO "industry_packages";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_industry_patches') THEN
    ALTER TABLE "_deprecated_industry_patches" RENAME TO "industry_patches";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_ip_access_rules') THEN
    ALTER TABLE "_deprecated_ip_access_rules" RENAME TO "ip_access_rules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_license_keys') THEN
    ALTER TABLE "_deprecated_license_keys" RENAME TO "license_keys";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_listing_analytics') THEN
    ALTER TABLE "_deprecated_listing_analytics" RENAME TO "listing_analytics";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_listing_price_tiers') THEN
    ALTER TABLE "_deprecated_listing_price_tiers" RENAME TO "listing_price_tiers";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_marketplace_enquiries') THEN
    ALTER TABLE "_deprecated_marketplace_enquiries" RENAME TO "marketplace_enquiries";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_marketplace_order_items') THEN
    ALTER TABLE "_deprecated_marketplace_order_items" RENAME TO "marketplace_order_items";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_marketplace_reviews') THEN
    ALTER TABLE "_deprecated_marketplace_reviews" RENAME TO "marketplace_reviews";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_plan_limits') THEN
    ALTER TABLE "_deprecated_plan_limits" RENAME TO "plan_limits";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_plan_module_access') THEN
    ALTER TABLE "_deprecated_plan_module_access" RENAME TO "plan_module_access";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_plugin_hook_logs') THEN
    ALTER TABLE "_deprecated_plugin_hook_logs" RENAME TO "plugin_hook_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_post_analytics') THEN
    ALTER TABLE "_deprecated_post_analytics" RENAME TO "post_analytics";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_post_engagements') THEN
    ALTER TABLE "_deprecated_post_engagements" RENAME TO "post_engagements";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_recharge_plans') THEN
    ALTER TABLE "_deprecated_recharge_plans" RENAME TO "recharge_plans";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_role_menu_permissions') THEN
    ALTER TABLE "_deprecated_role_menu_permissions" RENAME TO "role_menu_permissions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_software_offers') THEN
    ALTER TABLE "_deprecated_software_offers" RENAME TO "software_offers";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_activity_logs') THEN
    ALTER TABLE "_deprecated_tenant_activity_logs" RENAME TO "tenant_activity_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_audit_logs') THEN
    ALTER TABLE "_deprecated_tenant_audit_logs" RENAME TO "tenant_audit_logs";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_brandings') THEN
    ALTER TABLE "_deprecated_tenant_brandings" RENAME TO "tenant_brandings";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_invoices') THEN
    ALTER TABLE "_deprecated_tenant_invoices" RENAME TO "tenant_invoices";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_marketplace_modules') THEN
    ALTER TABLE "_deprecated_tenant_marketplace_modules" RENAME TO "tenant_marketplace_modules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_modules') THEN
    ALTER TABLE "_deprecated_tenant_modules" RENAME TO "tenant_modules";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_plugins') THEN
    ALTER TABLE "_deprecated_tenant_plugins" RENAME TO "tenant_plugins";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_usage_details') THEN
    ALTER TABLE "_deprecated_tenant_usage_details" RENAME TO "tenant_usage_details";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_tenant_versions') THEN
    ALTER TABLE "_deprecated_tenant_versions" RENAME TO "tenant_versions";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_terminology_overrides') THEN
    ALTER TABLE "_deprecated_terminology_overrides" RENAME TO "terminology_overrides";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_user_capacities') THEN
    ALTER TABLE "_deprecated_user_capacities" RENAME TO "user_capacities";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_user_permission_overrides') THEN
    ALTER TABLE "_deprecated_user_permission_overrides" RENAME TO "user_permission_overrides";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_verification_otps') THEN
    ALTER TABLE "_deprecated_verification_otps" RENAME TO "verification_otps";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_version_backups') THEN
    ALTER TABLE "_deprecated_version_backups" RENAME TO "version_backups";
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_deprecated_wallet_transactions') THEN
    ALTER TABLE "_deprecated_wallet_transactions" RENAME TO "wallet_transactions";
  END IF;
END $$;

COMMIT;
