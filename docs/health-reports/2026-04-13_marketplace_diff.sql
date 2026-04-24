-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('PRODUCT', 'SERVICE', 'REQUIREMENT', 'JOB');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'EXPIRED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'PRODUCT_SHARE', 'CUSTOMER_FEEDBACK', 'PRODUCT_LAUNCH', 'POLL', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'HIDDEN', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "EngagementAction" AS ENUM ('LIKE', 'UNLIKE', 'SAVE', 'UNSAVE', 'SHARE', 'VIEW', 'CLICK', 'REPORT');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('ONE_TIME', 'DAILY_RECURRING', 'WEEKLY_RECURRING', 'FIRST_N_ORDERS', 'LAUNCH', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'BUNDLE_PRICE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('PUBLIC', 'GEO_TARGETED', 'VERIFIED_ONLY', 'MY_CONTACTS', 'SELECTED_CONTACTS', 'CATEGORY_BASED', 'GRADE_BASED');

-- CreateEnum
CREATE TYPE "ExpiryAction" AS ENUM ('DEACTIVATE', 'ARCHIVE', 'DELETE', 'NOTIFY_OWNER');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('IMPRESSION', 'CLICK', 'ENQUIRY', 'LEAD', 'CUSTOMER', 'ORDER', 'SHARE', 'SAVE');

-- CreateEnum
CREATE TYPE "AnalyticsEntityType" AS ENUM ('POST', 'LISTING', 'OFFER');

-- CreateEnum
CREATE TYPE "AnalyticsSource" AS ENUM ('FEED', 'SEARCH', 'SHARE_LINK', 'DIRECT', 'NOTIFICATION', 'QR_CODE', 'EXTERNAL');

-- DropForeignKey
ALTER TABLE "_deprecated_ai_chat_messages" DROP CONSTRAINT "ai_chat_messages_session_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_ai_documents" DROP CONSTRAINT "ai_documents_dataset_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_ai_training_jobs" DROP CONSTRAINT "ai_training_jobs_dataset_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_amc_schedules" DROP CONSTRAINT "amc_schedules_amc_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_bom_formula_items" DROP CONSTRAINT "bom_formula_items_formula_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_bom_formula_items" DROP CONSTRAINT "bom_formula_items_raw_material_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_bom_productions" DROP CONSTRAINT "bom_productions_formula_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_brand_contacts" DROP CONSTRAINT "brand_contacts_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_brand_contacts" DROP CONSTRAINT "brand_contacts_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_brand_organizations" DROP CONSTRAINT "brand_organizations_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_brand_organizations" DROP CONSTRAINT "brand_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_campaign_recipients" DROP CONSTRAINT "campaign_recipients_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_company_pincodes" DROP CONSTRAINT "company_pincodes_company_city_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_contact_organizations" DROP CONSTRAINT "contact_organizations_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_contact_organizations" DROP CONSTRAINT "contact_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_control_room_drafts" DROP CONSTRAINT "control_room_drafts_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_control_room_values" DROP CONSTRAINT "control_room_values_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_credit_notes" DROP CONSTRAINT "credit_notes_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_customer_group_mappings" DROP CONSTRAINT "customer_group_mappings_price_group_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_debit_note_items" DROP CONSTRAINT "debit_note_items_debit_note_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_delivery_challan_items" DROP CONSTRAINT "delivery_challan_items_challan_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_document_activities" DROP CONSTRAINT "document_activities_document_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_document_attachments" DROP CONSTRAINT "document_attachments_document_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_document_share_links" DROP CONSTRAINT "document_share_links_document_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_email_attachments" DROP CONSTRAINT "email_attachments_email_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_email_tracking_events" DROP CONSTRAINT "email_tracking_events_email_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_entity_config_values" DROP CONSTRAINT "entity_config_values_definition_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_event_history" DROP CONSTRAINT "event_history_event_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_event_participants" DROP CONSTRAINT "event_participants_event_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_goods_receipt_items" DROP CONSTRAINT "goods_receipt_items_receipt_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_import_rows" DROP CONSTRAINT "import_rows_import_job_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_invoice_line_items" DROP CONSTRAINT "invoice_line_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_lead_filters" DROP CONSTRAINT "lead_filters_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_ledger_mappings" DROP CONSTRAINT "ledger_mappings_ledger_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_manufacturer_contacts" DROP CONSTRAINT "manufacturer_contacts_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_manufacturer_contacts" DROP CONSTRAINT "manufacturer_contacts_manufacturer_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_manufacturer_organizations" DROP CONSTRAINT "manufacturer_organizations_manufacturer_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_manufacturer_organizations" DROP CONSTRAINT "manufacturer_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_notification_configs" DROP CONSTRAINT "notification_configs_template_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_organization_filters" DROP CONSTRAINT "organization_filters_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_organization_locations" DROP CONSTRAINT "organization_locations_location_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_organization_locations" DROP CONSTRAINT "organization_locations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_payment_receipts" DROP CONSTRAINT "payment_receipts_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_payment_reminders" DROP CONSTRAINT "payment_reminders_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_price_list_items" DROP CONSTRAINT "price_list_items_price_list_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_filters" DROP CONSTRAINT "product_filters_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_prices" DROP CONSTRAINT "product_prices_price_group_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_prices" DROP CONSTRAINT "product_prices_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_relations" DROP CONSTRAINT "product_relations_from_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_relations" DROP CONSTRAINT "product_relations_to_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_tax_details" DROP CONSTRAINT "product_tax_details_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_product_unit_conversions" DROP CONSTRAINT "product_unit_conversions_product_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_proforma_line_items" DROP CONSTRAINT "proforma_line_items_proforma_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_purchase_invoice_items" DROP CONSTRAINT "purchase_invoice_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_purchase_order_items" DROP CONSTRAINT "purchase_order_items_po_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_purchase_quotation_items" DROP CONSTRAINT "purchase_quotation_items_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_purchase_rfq_items" DROP CONSTRAINT "purchase_rfq_items_rfq_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_quotation_activities" DROP CONSTRAINT "quotation_activities_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_quotation_line_items" DROP CONSTRAINT "quotation_line_items_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_quotation_negotiation_logs" DROP CONSTRAINT "quotation_negotiation_logs_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_quotation_send_logs" DROP CONSTRAINT "quotation_send_logs_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_report_bookmarks" DROP CONSTRAINT "report_bookmarks_report_def_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_report_templates" DROP CONSTRAINT "report_templates_report_def_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_sale_order_items" DROP CONSTRAINT "sale_order_items_sale_order_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_sale_return_items" DROP CONSTRAINT "sale_return_items_return_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_scheduled_reports" DROP CONSTRAINT "scheduled_reports_report_def_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_serial_masters" DROP CONSTRAINT "serial_masters_inventory_item_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_service_charges" DROP CONSTRAINT "service_charges_service_visit_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_shortcut_user_overrides" DROP CONSTRAINT "shortcut_user_overrides_shortcut_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_stock_summaries" DROP CONSTRAINT "stock_summaries_inventory_item_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_stock_transactions" DROP CONSTRAINT "stock_transactions_inventory_item_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_support_ticket_messages" DROP CONSTRAINT "support_ticket_messages_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_sync_warning_rules" DROP CONSTRAINT "sync_warning_rules_policy_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_task_history" DROP CONSTRAINT "task_history_task_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_task_watchers" DROP CONSTRAINT "task_watchers_task_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tenant_template_customizations" DROP CONSTRAINT "tenant_template_customizations_template_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_tour_plan_photos" DROP CONSTRAINT "tour_plan_photos_tour_plan_visit_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_broadcast_recipients" DROP CONSTRAINT "wa_broadcast_recipients_broadcast_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_chatbot_flows" DROP CONSTRAINT "wa_chatbot_flows_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_messages" DROP CONSTRAINT "wa_messages_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_messages" DROP CONSTRAINT "wa_messages_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_opt_outs" DROP CONSTRAINT "wa_opt_outs_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_wa_quick_replies" DROP CONSTRAINT "wa_quick_replies_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_warranty_claims" DROP CONSTRAINT "warranty_claims_warranty_record_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_webhook_deliveries" DROP CONSTRAINT "webhook_deliveries_endpoint_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_action_logs" DROP CONSTRAINT "workflow_action_logs_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_action_logs" DROP CONSTRAINT "workflow_action_logs_transition_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_approvals" DROP CONSTRAINT "workflow_approvals_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_approvals" DROP CONSTRAINT "workflow_approvals_transition_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_history" DROP CONSTRAINT "workflow_history_from_state_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_history" DROP CONSTRAINT "workflow_history_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_history" DROP CONSTRAINT "workflow_history_to_state_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_history" DROP CONSTRAINT "workflow_history_transition_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_sla_escalations" DROP CONSTRAINT "workflow_sla_escalations_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "_deprecated_workflow_sla_escalations" DROP CONSTRAINT "workflow_sla_escalations_state_id_fkey";

-- DropForeignKey
ALTER TABLE "account_groups" DROP CONSTRAINT "account_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_chat_sessions" DROP CONSTRAINT "ai_chat_sessions_system_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "amc_contracts" DROP CONSTRAINT "amc_contracts_amc_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "bom_formulas" DROP CONSTRAINT "bom_formulas_finished_product_id_fkey";

-- DropForeignKey
ALTER TABLE "business_locations" DROP CONSTRAINT "business_locations_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_task_id_fkey";

-- DropForeignKey
ALTER TABLE "communications" DROP CONSTRAINT "communications_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "communications" DROP CONSTRAINT "communications_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "communications" DROP CONSTRAINT "communications_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "communications" DROP CONSTRAINT "communications_raw_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "company_cities" DROP CONSTRAINT "company_cities_company_state_id_fkey";

-- DropForeignKey
ALTER TABLE "company_states" DROP CONSTRAINT "company_states_company_country_id_fkey";

-- DropForeignKey
ALTER TABLE "contact_filters" DROP CONSTRAINT "contact_filters_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "cron_job_run_logs" DROP CONSTRAINT "cron_job_run_logs_job_id_fkey";

-- DropForeignKey
ALTER TABLE "delivery_challans" DROP CONSTRAINT "delivery_challans_sale_order_id_fkey";

-- DropForeignKey
ALTER TABLE "demos" DROP CONSTRAINT "demos_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "document_folders" DROP CONSTRAINT "document_folders_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_parent_version_id_fkey";

-- DropForeignKey
ALTER TABLE "emails" DROP CONSTRAINT "emails_account_id_fkey";

-- DropForeignKey
ALTER TABLE "emails" DROP CONSTRAINT "emails_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "emails" DROP CONSTRAINT "emails_thread_id_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipts" DROP CONSTRAINT "goods_receipts_po_id_fkey";

-- DropForeignKey
ALTER TABLE "import_jobs" DROP CONSTRAINT "import_jobs_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "ledger_masters" DROP CONSTRAINT "ledger_masters_account_group_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_manufacturer_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "proforma_invoices" DROP CONSTRAINT "proforma_invoices_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "proforma_invoices" DROP CONSTRAINT "proforma_invoices_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "proforma_invoices" DROP CONSTRAINT "proforma_invoices_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "proforma_invoices" DROP CONSTRAINT "proforma_invoices_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "proforma_invoices" DROP CONSTRAINT "proforma_invoices_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_invoices" DROP CONSTRAINT "purchase_invoices_po_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_quotations" DROP CONSTRAINT "purchase_quotations_rfq_id_fkey";

-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_contact_person_id_fkey";

-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_parent_quotation_id_fkey";

-- DropForeignKey
ALTER TABLE "raw_contact_filters" DROP CONSTRAINT "raw_contact_filters_raw_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "raw_contacts" DROP CONSTRAINT "raw_contacts_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "reminders" DROP CONSTRAINT "reminders_task_id_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_events" DROP CONSTRAINT "scheduled_events_parent_event_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_parent_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tour_plan_visits" DROP CONSTRAINT "tour_plan_visits_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "tour_plan_visits" DROP CONSTRAINT "tour_plan_visits_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "tour_plan_visits" DROP CONSTRAINT "tour_plan_visits_tour_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "tour_plans" DROP CONSTRAINT "tour_plans_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "wa_broadcasts" DROP CONSTRAINT "wa_broadcasts_template_id_fkey";

-- DropForeignKey
ALTER TABLE "wa_broadcasts" DROP CONSTRAINT "wa_broadcasts_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "wa_conversations" DROP CONSTRAINT "wa_conversations_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "wa_templates" DROP CONSTRAINT "wa_templates_waba_id_fkey";

-- DropForeignKey
ALTER TABLE "warranty_records" DROP CONSTRAINT "warranty_records_warranty_template_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_instances" DROP CONSTRAINT "workflow_instances_current_state_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_instances" DROP CONSTRAINT "workflow_instances_previous_state_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_instances" DROP CONSTRAINT "workflow_instances_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_states" DROP CONSTRAINT "workflow_states_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_transitions" DROP CONSTRAINT "workflow_transitions_from_state_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_transitions" DROP CONSTRAINT "workflow_transitions_to_state_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_transitions" DROP CONSTRAINT "workflow_transitions_workflow_id_fkey";

-- DropTable
DROP TABLE "_deprecated_account_transactions";

-- DropTable
DROP TABLE "_deprecated_ai_chat_messages";

-- DropTable
DROP TABLE "_deprecated_ai_documents";

-- DropTable
DROP TABLE "_deprecated_ai_embeddings";

-- DropTable
DROP TABLE "_deprecated_ai_models";

-- DropTable
DROP TABLE "_deprecated_ai_settings";

-- DropTable
DROP TABLE "_deprecated_ai_training_jobs";

-- DropTable
DROP TABLE "_deprecated_ai_usage_logs";

-- DropTable
DROP TABLE "_deprecated_amc_schedules";

-- DropTable
DROP TABLE "_deprecated_api_request_logs";

-- DropTable
DROP TABLE "_deprecated_approval_requests";

-- DropTable
DROP TABLE "_deprecated_approval_rules";

-- DropTable
DROP TABLE "_deprecated_assignment_rules";

-- DropTable
DROP TABLE "_deprecated_bank_accounts";

-- DropTable
DROP TABLE "_deprecated_bank_reconciliations";

-- DropTable
DROP TABLE "_deprecated_blocked_slots";

-- DropTable
DROP TABLE "_deprecated_bom_formula_items";

-- DropTable
DROP TABLE "_deprecated_bom_productions";

-- DropTable
DROP TABLE "_deprecated_brand_contacts";

-- DropTable
DROP TABLE "_deprecated_brand_organizations";

-- DropTable
DROP TABLE "_deprecated_business_hours_schedules";

-- DropTable
DROP TABLE "_deprecated_calendar_configs";

-- DropTable
DROP TABLE "_deprecated_calendar_events";

-- DropTable
DROP TABLE "_deprecated_calendar_highlights";

-- DropTable
DROP TABLE "_deprecated_campaign_recipients";

-- DropTable
DROP TABLE "_deprecated_cloud_connections";

-- DropTable
DROP TABLE "_deprecated_communication_logs";

-- DropTable
DROP TABLE "_deprecated_company_pincodes";

-- DropTable
DROP TABLE "_deprecated_company_profiles";

-- DropTable
DROP TABLE "_deprecated_contact_organizations";

-- DropTable
DROP TABLE "_deprecated_control_room_audit_logs";

-- DropTable
DROP TABLE "_deprecated_control_room_drafts";

-- DropTable
DROP TABLE "_deprecated_control_room_values";

-- DropTable
DROP TABLE "_deprecated_credit_notes";

-- DropTable
DROP TABLE "_deprecated_customer_group_mappings";

-- DropTable
DROP TABLE "_deprecated_data_masking_policies";

-- DropTable
DROP TABLE "_deprecated_debit_note_items";

-- DropTable
DROP TABLE "_deprecated_delivery_challan_items";

-- DropTable
DROP TABLE "_deprecated_document_activities";

-- DropTable
DROP TABLE "_deprecated_document_attachments";

-- DropTable
DROP TABLE "_deprecated_document_share_links";

-- DropTable
DROP TABLE "_deprecated_email_attachments";

-- DropTable
DROP TABLE "_deprecated_email_footer_templates";

-- DropTable
DROP TABLE "_deprecated_email_signatures";

-- DropTable
DROP TABLE "_deprecated_email_templates";

-- DropTable
DROP TABLE "_deprecated_email_tracking_events";

-- DropTable
DROP TABLE "_deprecated_email_unsubscribes";

-- DropTable
DROP TABLE "_deprecated_entity_config_values";

-- DropTable
DROP TABLE "_deprecated_entity_owners";

-- DropTable
DROP TABLE "_deprecated_entity_verification_records";

-- DropTable
DROP TABLE "_deprecated_escalation_rules";

-- DropTable
DROP TABLE "_deprecated_event_history";

-- DropTable
DROP TABLE "_deprecated_event_participants";

-- DropTable
DROP TABLE "_deprecated_export_jobs";

-- DropTable
DROP TABLE "_deprecated_follow_ups";

-- DropTable
DROP TABLE "_deprecated_goods_receipt_items";

-- DropTable
DROP TABLE "_deprecated_google_connections";

-- DropTable
DROP TABLE "_deprecated_gst_returns";

-- DropTable
DROP TABLE "_deprecated_gst_verification_logs";

-- DropTable
DROP TABLE "_deprecated_holiday_calendars";

-- DropTable
DROP TABLE "_deprecated_import_rows";

-- DropTable
DROP TABLE "_deprecated_inventory_labels";

-- DropTable
DROP TABLE "_deprecated_invoice_line_items";

-- DropTable
DROP TABLE "_deprecated_lead_filters";

-- DropTable
DROP TABLE "_deprecated_ledger_mappings";

-- DropTable
DROP TABLE "_deprecated_manufacturer_contacts";

-- DropTable
DROP TABLE "_deprecated_manufacturer_organizations";

-- DropTable
DROP TABLE "_deprecated_notification_configs";

-- DropTable
DROP TABLE "_deprecated_notification_preferences";

-- DropTable
DROP TABLE "_deprecated_notion_configs";

-- DropTable
DROP TABLE "_deprecated_organization_filters";

-- DropTable
DROP TABLE "_deprecated_organization_locations";

-- DropTable
DROP TABLE "_deprecated_ownership_logs";

-- DropTable
DROP TABLE "_deprecated_payment_receipts";

-- DropTable
DROP TABLE "_deprecated_payment_records";

-- DropTable
DROP TABLE "_deprecated_payment_reminders";

-- DropTable
DROP TABLE "_deprecated_price_list_items";

-- DropTable
DROP TABLE "_deprecated_product_filters";

-- DropTable
DROP TABLE "_deprecated_product_prices";

-- DropTable
DROP TABLE "_deprecated_product_relations";

-- DropTable
DROP TABLE "_deprecated_product_tax_details";

-- DropTable
DROP TABLE "_deprecated_product_unit_conversions";

-- DropTable
DROP TABLE "_deprecated_proforma_line_items";

-- DropTable
DROP TABLE "_deprecated_purchase_invoice_items";

-- DropTable
DROP TABLE "_deprecated_purchase_masters";

-- DropTable
DROP TABLE "_deprecated_purchase_order_items";

-- DropTable
DROP TABLE "_deprecated_purchase_quotation_items";

-- DropTable
DROP TABLE "_deprecated_purchase_rfq_items";

-- DropTable
DROP TABLE "_deprecated_push_subscriptions";

-- DropTable
DROP TABLE "_deprecated_quiet_hour_configs";

-- DropTable
DROP TABLE "_deprecated_quotation_activities";

-- DropTable
DROP TABLE "_deprecated_quotation_comparisons";

-- DropTable
DROP TABLE "_deprecated_quotation_line_items";

-- DropTable
DROP TABLE "_deprecated_quotation_negotiation_logs";

-- DropTable
DROP TABLE "_deprecated_quotation_send_logs";

-- DropTable
DROP TABLE "_deprecated_quotation_templates";

-- DropTable
DROP TABLE "_deprecated_rate_limit_tiers";

-- DropTable
DROP TABLE "_deprecated_recurring_events";

-- DropTable
DROP TABLE "_deprecated_report_bookmarks";

-- DropTable
DROP TABLE "_deprecated_report_export_logs";

-- DropTable
DROP TABLE "_deprecated_report_templates";

-- DropTable
DROP TABLE "_deprecated_sale_masters";

-- DropTable
DROP TABLE "_deprecated_sale_order_items";

-- DropTable
DROP TABLE "_deprecated_sale_return_items";

-- DropTable
DROP TABLE "_deprecated_sales_targets";

-- DropTable
DROP TABLE "_deprecated_saved_filters";

-- DropTable
DROP TABLE "_deprecated_saved_formulas";

-- DropTable
DROP TABLE "_deprecated_scheduled_reports";

-- DropTable
DROP TABLE "_deprecated_scrap_records";

-- DropTable
DROP TABLE "_deprecated_serial_masters";

-- DropTable
DROP TABLE "_deprecated_service_charges";

-- DropTable
DROP TABLE "_deprecated_service_rates";

-- DropTable
DROP TABLE "_deprecated_shortcut_user_overrides";

-- DropTable
DROP TABLE "_deprecated_stock_adjustments";

-- DropTable
DROP TABLE "_deprecated_stock_locations";

-- DropTable
DROP TABLE "_deprecated_stock_summaries";

-- DropTable
DROP TABLE "_deprecated_stock_transactions";

-- DropTable
DROP TABLE "_deprecated_support_ticket_messages";

-- DropTable
DROP TABLE "_deprecated_sync_audit_logs";

-- DropTable
DROP TABLE "_deprecated_sync_change_logs";

-- DropTable
DROP TABLE "_deprecated_sync_conflicts";

-- DropTable
DROP TABLE "_deprecated_sync_devices";

-- DropTable
DROP TABLE "_deprecated_sync_flush_commands";

-- DropTable
DROP TABLE "_deprecated_sync_warning_rules";

-- DropTable
DROP TABLE "_deprecated_table_configs";

-- DropTable
DROP TABLE "_deprecated_task_history";

-- DropTable
DROP TABLE "_deprecated_task_watchers";

-- DropTable
DROP TABLE "_deprecated_tds_records";

-- DropTable
DROP TABLE "_deprecated_tenant_rule_cache_versions";

-- DropTable
DROP TABLE "_deprecated_tenant_template_customizations";

-- DropTable
DROP TABLE "_deprecated_tour_plan_photos";

-- DropTable
DROP TABLE "_deprecated_unit_conversions";

-- DropTable
DROP TABLE "_deprecated_unit_masters";

-- DropTable
DROP TABLE "_deprecated_unmask_audit_logs";

-- DropTable
DROP TABLE "_deprecated_user_availability";

-- DropTable
DROP TABLE "_deprecated_user_calendar_syncs";

-- DropTable
DROP TABLE "_deprecated_verification_invites";

-- DropTable
DROP TABLE "_deprecated_wa_broadcast_recipients";

-- DropTable
DROP TABLE "_deprecated_wa_chatbot_flows";

-- DropTable
DROP TABLE "_deprecated_wa_messages";

-- DropTable
DROP TABLE "_deprecated_wa_opt_outs";

-- DropTable
DROP TABLE "_deprecated_wa_quick_replies";

-- DropTable
DROP TABLE "_deprecated_warranty_claims";

-- DropTable
DROP TABLE "_deprecated_webhook_deliveries";

-- DropTable
DROP TABLE "_deprecated_workflow_action_logs";

-- DropTable
DROP TABLE "_deprecated_workflow_approvals";

-- DropTable
DROP TABLE "_deprecated_workflow_history";

-- DropTable
DROP TABLE "_deprecated_workflow_sla_escalations";

-- DropTable
DROP TABLE "account_groups";

-- DropTable
DROP TABLE "activities";

-- DropTable
DROP TABLE "ai_chat_sessions";

-- DropTable
DROP TABLE "ai_datasets";

-- DropTable
DROP TABLE "ai_system_prompts";

-- DropTable
DROP TABLE "amc_contracts";

-- DropTable
DROP TABLE "amc_plan_templates";

-- DropTable
DROP TABLE "api_keys";

-- DropTable
DROP TABLE "auto_number_sequences";

-- DropTable
DROP TABLE "bom_formulas";

-- DropTable
DROP TABLE "brands";

-- DropTable
DROP TABLE "business_locations";

-- DropTable
DROP TABLE "comments";

-- DropTable
DROP TABLE "communications";

-- DropTable
DROP TABLE "company_cities";

-- DropTable
DROP TABLE "company_countries";

-- DropTable
DROP TABLE "company_states";

-- DropTable
DROP TABLE "contact_filters";

-- DropTable
DROP TABLE "contacts";

-- DropTable
DROP TABLE "control_room_rules";

-- DropTable
DROP TABLE "cron_job_configs";

-- DropTable
DROP TABLE "cron_job_run_logs";

-- DropTable
DROP TABLE "custom_field_definitions";

-- DropTable
DROP TABLE "customer_price_groups";

-- DropTable
DROP TABLE "debit_notes";

-- DropTable
DROP TABLE "delivery_challans";

-- DropTable
DROP TABLE "demos";

-- DropTable
DROP TABLE "document_folders";

-- DropTable
DROP TABLE "document_templates";

-- DropTable
DROP TABLE "documents";

-- DropTable
DROP TABLE "email_accounts";

-- DropTable
DROP TABLE "email_campaigns";

-- DropTable
DROP TABLE "email_threads";

-- DropTable
DROP TABLE "emails";

-- DropTable
DROP TABLE "goods_receipts";

-- DropTable
DROP TABLE "import_jobs";

-- DropTable
DROP TABLE "import_profiles";

-- DropTable
DROP TABLE "inventory_items";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "leads";

-- DropTable
DROP TABLE "ledger_masters";

-- DropTable
DROP TABLE "manufacturers";

-- DropTable
DROP TABLE "notification_templates";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "organizations";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "price_lists";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "proforma_invoices";

-- DropTable
DROP TABLE "purchase_invoices";

-- DropTable
DROP TABLE "purchase_orders";

-- DropTable
DROP TABLE "purchase_quotations";

-- DropTable
DROP TABLE "purchase_rfqs";

-- DropTable
DROP TABLE "quotations";

-- DropTable
DROP TABLE "raw_contact_filters";

-- DropTable
DROP TABLE "raw_contacts";

-- DropTable
DROP TABLE "refunds";

-- DropTable
DROP TABLE "reminders";

-- DropTable
DROP TABLE "report_definitions";

-- DropTable
DROP TABLE "sale_orders";

-- DropTable
DROP TABLE "sale_returns";

-- DropTable
DROP TABLE "scheduled_events";

-- DropTable
DROP TABLE "service_visit_logs";

-- DropTable
DROP TABLE "shortcut_definitions";

-- DropTable
DROP TABLE "support_tickets";

-- DropTable
DROP TABLE "sync_policies";

-- DropTable
DROP TABLE "task_logic_configs";

-- DropTable
DROP TABLE "tasks";

-- DropTable
DROP TABLE "tour_plan_visits";

-- DropTable
DROP TABLE "tour_plans";

-- DropTable
DROP TABLE "wa_broadcasts";

-- DropTable
DROP TABLE "wa_conversations";

-- DropTable
DROP TABLE "wa_templates";

-- DropTable
DROP TABLE "warranty_records";

-- DropTable
DROP TABLE "warranty_templates";

-- DropTable
DROP TABLE "webhook_endpoints";

-- DropTable
DROP TABLE "whatsapp_business_accounts";

-- DropTable
DROP TABLE "workflow_instances";

-- DropTable
DROP TABLE "workflow_states";

-- DropTable
DROP TABLE "workflow_transitions";

-- DropTable
DROP TABLE "workflows";

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "AdjustmentStatus";

-- DropEnum
DROP TYPE "AiChatSessionStatus";

-- DropEnum
DROP TYPE "AiDatasetStatus";

-- DropEnum
DROP TYPE "AiModelSource";

-- DropEnum
DROP TYPE "AiModelStatus";

-- DropEnum
DROP TYPE "AiTrainingJobStatus";

-- DropEnum
DROP TYPE "ApiKeyStatus";

-- DropEnum
DROP TYPE "ApiLogLevel";

-- DropEnum
DROP TYPE "AssignmentMethod";

-- DropEnum
DROP TYPE "AssignmentRuleStatus";

-- DropEnum
DROP TYPE "AvailabilityStatus";

-- DropEnum
DROP TYPE "CalendarSourceType";

-- DropEnum
DROP TYPE "CalendarSyncDirection";

-- DropEnum
DROP TYPE "CalendarSyncProvider";

-- DropEnum
DROP TYPE "CalendarSyncStatus";

-- DropEnum
DROP TYPE "CampaignRecipientStatus";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "ChangeAction";

-- DropEnum
DROP TYPE "CloudConnectionStatus";

-- DropEnum
DROP TYPE "CommentEntityType";

-- DropEnum
DROP TYPE "CommentVisibility";

-- DropEnum
DROP TYPE "CommunicationType";

-- DropEnum
DROP TYPE "ConflictStatus";

-- DropEnum
DROP TYPE "ConflictStrategy";

-- DropEnum
DROP TYPE "ContactOrgRelationType";

-- DropEnum
DROP TYPE "ContactSource";

-- DropEnum
DROP TYPE "ContactType";

-- DropEnum
DROP TYPE "CreditNoteStatus";

-- DropEnum
DROP TYPE "CronAlertChannel";

-- DropEnum
DROP TYPE "CronJobScope";

-- DropEnum
DROP TYPE "CronJobStatus";

-- DropEnum
DROP TYPE "CronRunStatus";

-- DropEnum
DROP TYPE "DataStatus";

-- DropEnum
DROP TYPE "DayOfWeek";

-- DropEnum
DROP TYPE "DemoMode";

-- DropEnum
DROP TYPE "DemoResult";

-- DropEnum
DROP TYPE "DemoStatus";

-- DropEnum
DROP TYPE "DeviceStatus";

-- DropEnum
DROP TYPE "DigestFrequency";

-- DropEnum
DROP TYPE "DocumentCategory";

-- DropEnum
DROP TYPE "DocumentStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "DuplicateConfidence";

-- DropEnum
DROP TYPE "DuplicateStrategy";

-- DropEnum
DROP TYPE "EmailAccountStatus";

-- DropEnum
DROP TYPE "EmailDirection";

-- DropEnum
DROP TYPE "EmailPriority";

-- DropEnum
DROP TYPE "EmailProvider";

-- DropEnum
DROP TYPE "EmailStatus";

-- DropEnum
DROP TYPE "EntityLimitType";

-- DropEnum
DROP TYPE "EntityType";

-- DropEnum
DROP TYPE "EntityVerificationChannel";

-- DropEnum
DROP TYPE "EntityVerificationMode";

-- DropEnum
DROP TYPE "EntityVerificationStatus";

-- DropEnum
DROP TYPE "EscalationAction";

-- DropEnum
DROP TYPE "EventStatus";

-- DropEnum
DROP TYPE "ExpiryType";

-- DropEnum
DROP TYPE "ExportStatus";

-- DropEnum
DROP TYPE "FeatureType";

-- DropEnum
DROP TYPE "FlushStatus";

-- DropEnum
DROP TYPE "FlushType";

-- DropEnum
DROP TYPE "FollowUpPriority";

-- DropEnum
DROP TYPE "HolidayType";

-- DropEnum
DROP TYPE "ImportJobStatus";

-- DropEnum
DROP TYPE "ImportRowStatus";

-- DropEnum
DROP TYPE "ImportTargetEntity";

-- DropEnum
DROP TYPE "InventoryTaxType";

-- DropEnum
DROP TYPE "InventoryType";

-- DropEnum
DROP TYPE "InviteChannel";

-- DropEnum
DROP TYPE "InviteSourceEntityType";

-- DropEnum
DROP TYPE "InviteStatus";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "LeadPriority";

-- DropEnum
DROP TYPE "LeadStatus";

-- DropEnum
DROP TYPE "LocationLevel";

-- DropEnum
DROP TYPE "NegotiationType";

-- DropEnum
DROP TYPE "NotificationCategory";

-- DropEnum
DROP TYPE "NotificationChannel";

-- DropEnum
DROP TYPE "NotificationEventCategory";

-- DropEnum
DROP TYPE "NotificationEventType";

-- DropEnum
DROP TYPE "NotificationPriority";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "OrgType";

-- DropEnum
DROP TYPE "OwnerType";

-- DropEnum
DROP TYPE "OwnershipAction";

-- DropEnum
DROP TYPE "PaymentGateway";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PriceType";

-- DropEnum
DROP TYPE "PriorityType";

-- DropEnum
DROP TYPE "ProductStatus";

-- DropEnum
DROP TYPE "ProfileStatus";

-- DropEnum
DROP TYPE "ProformaInvoiceStatus";

-- DropEnum
DROP TYPE "QuotationPriceType";

-- DropEnum
DROP TYPE "QuotationSendChannel";

-- DropEnum
DROP TYPE "QuotationStatus";

-- DropEnum
DROP TYPE "RSVPStatus";

-- DropEnum
DROP TYPE "RawContactSource";

-- DropEnum
DROP TYPE "RawContactStatus";

-- DropEnum
DROP TYPE "RecurrencePattern";

-- DropEnum
DROP TYPE "RefundStatus";

-- DropEnum
DROP TYPE "ReminderChannel";

-- DropEnum
DROP TYPE "ReminderLevel";

-- DropEnum
DROP TYPE "ReminderStatus";

-- DropEnum
DROP TYPE "ReminderType";

-- DropEnum
DROP TYPE "ReportCategory";

-- DropEnum
DROP TYPE "ReportFormat";

-- DropEnum
DROP TYPE "ReportFrequency";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "RuleConditionOperator";

-- DropEnum
DROP TYPE "ScheduledEventType";

-- DropEnum
DROP TYPE "ScheduledReportStatus";

-- DropEnum
DROP TYPE "ScrapType";

-- DropEnum
DROP TYPE "SequenceResetPolicy";

-- DropEnum
DROP TYPE "SerialStatus";

-- DropEnum
DROP TYPE "ShareLinkAccess";

-- DropEnum
DROP TYPE "StockTransactionType";

-- DropEnum
DROP TYPE "StorageProvider";

-- DropEnum
DROP TYPE "StorageType";

-- DropEnum
DROP TYPE "SyncDirection";

-- DropEnum
DROP TYPE "SyncEnforcement";

-- DropEnum
DROP TYPE "SyncWarningLevel";

-- DropEnum
DROP TYPE "SyncWarningTrigger";

-- DropEnum
DROP TYPE "TargetMetric";

-- DropEnum
DROP TYPE "TargetPeriod";

-- DropEnum
DROP TYPE "TaskAssignmentScope";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskRecurrence";

-- DropEnum
DROP TYPE "TaskStatus";

-- DropEnum
DROP TYPE "TaskType";

-- DropEnum
DROP TYPE "TaxType";

-- DropEnum
DROP TYPE "TemplateCategory";

-- DropEnum
DROP TYPE "TicketCategory";

-- DropEnum
DROP TYPE "TicketPriority";

-- DropEnum
DROP TYPE "TicketStatus";

-- DropEnum
DROP TYPE "TourPlanStatus";

-- DropEnum
DROP TYPE "UnitCategory";

-- DropEnum
DROP TYPE "UnitType";

-- DropEnum
DROP TYPE "ValidatorType";

-- DropEnum
DROP TYPE "VerificationOutcomeStatus";

-- DropEnum
DROP TYPE "VerifiedByType";

-- DropEnum
DROP TYPE "WaBroadcastRecipientStatus";

-- DropEnum
DROP TYPE "WaBroadcastStatus";

-- DropEnum
DROP TYPE "WaChatbotFlowStatus";

-- DropEnum
DROP TYPE "WaChatbotNodeType";

-- DropEnum
DROP TYPE "WaConversationStatus";

-- DropEnum
DROP TYPE "WaMessageDirection";

-- DropEnum
DROP TYPE "WaMessageStatus";

-- DropEnum
DROP TYPE "WaMessageType";

-- DropEnum
DROP TYPE "WaTemplateCategory";

-- DropEnum
DROP TYPE "WaTemplateStatus";

-- DropEnum
DROP TYPE "WabaConnectionStatus";

-- DropEnum
DROP TYPE "WebhookDeliveryStatus";

-- DropEnum
DROP TYPE "WebhookStatus";

-- DropEnum
DROP TYPE "WorkflowApprovalStatus";

-- DropEnum
DROP TYPE "WorkflowStateCategory";

-- DropEnum
DROP TYPE "WorkflowStateType";

-- DropEnum
DROP TYPE "WorkflowTriggerType";

-- CreateTable
CREATE TABLE "mkt_listings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "category_id" TEXT,
    "subcategory_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "mrp" INTEGER,
    "min_order_qty" INTEGER NOT NULL DEFAULT 1,
    "max_order_qty" INTEGER,
    "hsn_code" TEXT,
    "gst_rate" DOUBLE PRECISION,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "stock_available" INTEGER NOT NULL DEFAULT 0,
    "stock_reserved" INTEGER NOT NULL DEFAULT 0,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC',
    "visibility_config" JSONB,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'DEACTIVATE',
    "published_at" TIMESTAMP(3),
    "requirement_config" JSONB,
    "shipping_config" JSONB,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "slug" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "mkt_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_listing_price_tiers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "max_qty" INTEGER,
    "price_per_unit" INTEGER NOT NULL,
    "requires_verification" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_listing_price_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "post_type" "PostType" NOT NULL,
    "content" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "linked_listing_id" TEXT,
    "linked_offer_id" TEXT,
    "rating" INTEGER,
    "product_id" TEXT,
    "visibility" "VisibilityType" NOT NULL DEFAULT 'PUBLIC',
    "visibility_config" JSONB,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expiry_action" "ExpiryAction" NOT NULL DEFAULT 'DEACTIVATE',
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "poll_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "mkt_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_post_engagements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "EngagementAction" NOT NULL,
    "shared_to" TEXT,
    "city" TEXT,
    "state" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_post_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_post_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "media_url" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mkt_post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_offers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "offer_type" "OfferType" NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "linked_listing_ids" TEXT[],
    "linked_category_ids" TEXT[],
    "primary_listing_id" TEXT,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "max_redemptions" INTEGER,
    "current_redemptions" INTEGER NOT NULL DEFAULT 0,
    "auto_close_on_limit" BOOLEAN NOT NULL DEFAULT true,
    "reset_time" TEXT,
    "last_reset_at" TIMESTAMP(3),
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closed_reason" TEXT,
    "impression_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "enquiry_count" INTEGER NOT NULL DEFAULT 0,
    "lead_count" INTEGER NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "total_order_value" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,

    CONSTRAINT "mkt_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_offer_redemptions" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT,
    "discount_applied" INTEGER NOT NULL,
    "order_value" INTEGER,
    "city" TEXT,
    "state" TEXT,
    "device_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_offer_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "media_urls" JSONB NOT NULL DEFAULT '[]',
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "order_id" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderator_id" TEXT,
    "moderation_note" TEXT,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "seller_response" TEXT,
    "seller_responded_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mkt_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_enquiries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "enquirer_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quantity" INTEGER,
    "expected_price" INTEGER,
    "delivery_pincode" TEXT,
    "crm_lead_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mkt_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_analytics_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" "AnalyticsEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" "AnalyticsEventType" NOT NULL,
    "user_id" TEXT,
    "source" "AnalyticsSource" NOT NULL DEFAULT 'FEED',
    "device_type" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "order_value" INTEGER,
    "metadata" JSONB DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_analytics_summaries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" "AnalyticsEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "unique_impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "enquiries" INTEGER NOT NULL DEFAULT 0,
    "enquiry_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "lead_conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "order_conversion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_order_value" INTEGER NOT NULL DEFAULT 0,
    "top_cities" JSONB NOT NULL DEFAULT '[]',
    "top_states" JSONB NOT NULL DEFAULT '[]',
    "peak_hours" JSONB NOT NULL DEFAULT '[]',
    "device_breakdown" JSONB NOT NULL DEFAULT '{}',
    "source_breakdown" JSONB NOT NULL DEFAULT '{}',
    "listing_id" TEXT,
    "post_id" TEXT,
    "offer_id" TEXT,
    "last_computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mkt_analytics_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_requirement_quotes" (
    "id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "price_per_unit" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "delivery_days" INTEGER NOT NULL,
    "credit_days" INTEGER,
    "notes" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mkt_requirement_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mkt_listings_slug_key" ON "mkt_listings"("slug");

-- CreateIndex
CREATE INDEX "mkt_listings_tenant_id_idx" ON "mkt_listings"("tenant_id");

-- CreateIndex
CREATE INDEX "mkt_listings_tenant_id_status_listing_type_idx" ON "mkt_listings"("tenant_id", "status", "listing_type");

-- CreateIndex
CREATE INDEX "mkt_listings_tenant_id_category_id_idx" ON "mkt_listings"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "mkt_listings_status_publish_at_idx" ON "mkt_listings"("status", "publish_at");

-- CreateIndex
CREATE INDEX "mkt_listings_status_expires_at_idx" ON "mkt_listings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "mkt_listing_price_tiers_listing_id_idx" ON "mkt_listing_price_tiers"("listing_id");

-- CreateIndex
CREATE INDEX "mkt_posts_tenant_id_status_created_at_idx" ON "mkt_posts"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "mkt_posts_author_id_idx" ON "mkt_posts"("author_id");

-- CreateIndex
CREATE INDEX "mkt_posts_status_publish_at_idx" ON "mkt_posts"("status", "publish_at");

-- CreateIndex
CREATE INDEX "mkt_post_engagements_post_id_idx" ON "mkt_post_engagements"("post_id");

-- CreateIndex
CREATE INDEX "mkt_post_engagements_user_id_idx" ON "mkt_post_engagements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_post_engagements_post_id_user_id_action_key" ON "mkt_post_engagements"("post_id", "user_id", "action");

-- CreateIndex
CREATE INDEX "mkt_post_comments_post_id_created_at_idx" ON "mkt_post_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "mkt_offers_tenant_id_status_idx" ON "mkt_offers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "mkt_offers_status_publish_at_idx" ON "mkt_offers"("status", "publish_at");

-- CreateIndex
CREATE INDEX "mkt_offers_status_expires_at_idx" ON "mkt_offers"("status", "expires_at");

-- CreateIndex
CREATE INDEX "mkt_offers_tenant_id_offer_type_status_idx" ON "mkt_offers"("tenant_id", "offer_type", "status");

-- CreateIndex
CREATE INDEX "mkt_offer_redemptions_offer_id_idx" ON "mkt_offer_redemptions"("offer_id");

-- CreateIndex
CREATE INDEX "mkt_offer_redemptions_user_id_idx" ON "mkt_offer_redemptions"("user_id");

-- CreateIndex
CREATE INDEX "mkt_offer_redemptions_offer_id_user_id_idx" ON "mkt_offer_redemptions"("offer_id", "user_id");

-- CreateIndex
CREATE INDEX "mkt_reviews_listing_id_status_idx" ON "mkt_reviews"("listing_id", "status");

-- CreateIndex
CREATE INDEX "mkt_reviews_reviewer_id_idx" ON "mkt_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "mkt_reviews_status_idx" ON "mkt_reviews"("status");

-- CreateIndex
CREATE INDEX "mkt_enquiries_listing_id_idx" ON "mkt_enquiries"("listing_id");

-- CreateIndex
CREATE INDEX "mkt_enquiries_enquirer_id_idx" ON "mkt_enquiries"("enquirer_id");

-- CreateIndex
CREATE INDEX "mkt_enquiries_tenant_id_status_idx" ON "mkt_enquiries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "mkt_analytics_events_entity_type_entity_id_event_type_idx" ON "mkt_analytics_events"("entity_type", "entity_id", "event_type");

-- CreateIndex
CREATE INDEX "mkt_analytics_events_tenant_id_timestamp_idx" ON "mkt_analytics_events"("tenant_id", "timestamp");

-- CreateIndex
CREATE INDEX "mkt_analytics_events_entity_id_event_type_timestamp_idx" ON "mkt_analytics_events"("entity_id", "event_type", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_analytics_summaries_listing_id_key" ON "mkt_analytics_summaries"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_analytics_summaries_post_id_key" ON "mkt_analytics_summaries"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_analytics_summaries_offer_id_key" ON "mkt_analytics_summaries"("offer_id");

-- CreateIndex
CREATE INDEX "mkt_analytics_summaries_entity_type_entity_id_idx" ON "mkt_analytics_summaries"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "mkt_analytics_summaries_tenant_id_idx" ON "mkt_analytics_summaries"("tenant_id");

-- CreateIndex
CREATE INDEX "mkt_follows_follower_id_idx" ON "mkt_follows"("follower_id");

-- CreateIndex
CREATE INDEX "mkt_follows_following_id_idx" ON "mkt_follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_follows_follower_id_following_id_key" ON "mkt_follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "mkt_requirement_quotes_requirement_id_idx" ON "mkt_requirement_quotes"("requirement_id");

-- CreateIndex
CREATE INDEX "mkt_requirement_quotes_seller_id_idx" ON "mkt_requirement_quotes"("seller_id");

-- AddForeignKey
ALTER TABLE "mkt_listing_price_tiers" ADD CONSTRAINT "mkt_listing_price_tiers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "mkt_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_post_engagements" ADD CONSTRAINT "mkt_post_engagements_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_post_comments" ADD CONSTRAINT "mkt_post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "mkt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_offers" ADD CONSTRAINT "mkt_offers_primary_listing_id_fkey" FOREIGN KEY ("primary_listing_id") REFERENCES "mkt_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_offer_redemptions" ADD CONSTRAINT "mkt_offer_redemptions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "mkt_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_reviews" ADD CONSTRAINT "mkt_reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_enquiries" ADD CONSTRAINT "mkt_enquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "mkt_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_analytics_summaries" ADD CONSTRAINT "mkt_analytics_summaries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "mkt_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_analytics_summaries" ADD CONSTRAINT "mkt_analytics_summaries_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "mkt_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mkt_analytics_summaries" ADD CONSTRAINT "mkt_analytics_summaries_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "mkt_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

