#!/usr/bin/env python3
"""
371-table naming rename sprint.
Generates:
  1. ALTER TABLE SQL per DB
  2. Prisma schema @@map patches

Run:  python3 scripts/rename-tables.py [--apply]
Without --apply: dry-run (print SQL + patch counts).
With --apply:    write patched schema files + print SQL for manual psql run.
"""

import re, sys, os

# ─── Rename mappings ──────────────────────────────────────────────────────────
# Format: old_table_name → new_table_name
# Rules: {vertical}_{module}_{description}
#   Verticals:   gv_ (General), soft_ (SoftwareVendor)
#   System:      pc_ (PlatformConsole), gl_ (GlobalReference) — no module check
#   Modules:     usr cfg inv crm sal pay acc tax hr mkt lic ven wf not rpt doc cmn aud qa

IDENTITY_RENAMES = {
    "users":                        "gv_usr_users",
    "customer_profiles":            "gv_usr_customer_profiles",
    "referral_partners":            "gv_usr_referral_partners",
    "departments":                  "gv_usr_departments",
    "designations":                 "gv_usr_designations",
    "roles":                        "gv_usr_roles",
    "permissions":                  "gv_usr_permissions",
    "role_permissions":             "gv_usr_role_permissions",
    "role_menu_permissions":        "gv_usr_role_menu_permissions",
    "permission_templates":         "gv_usr_permission_templates",
    "user_capacities":              "gv_usr_capacities",
    "delegation_records":           "gv_usr_delegation_records",
    "user_permission_overrides":    "gv_usr_permission_overrides",
    "menus":                        "gv_cfg_menus",
    "audit_logs":                   "gv_aud_logs",
    "audit_field_changes":          "gv_aud_field_changes",
    "audit_retention_policies":     "gv_aud_retention_policies",
    "tenants":                      "gv_usr_tenants",
    "plans":                        "gv_lic_plans",
    "subscriptions":                "gv_lic_subscriptions",
    "tenant_invoices":              "gv_lic_tenant_invoices",
    "tenant_usage":                 "gv_lic_tenant_usage",
    "super_admins":                 "gv_usr_super_admins",
    "tenant_configs":               "gv_cfg_tenant_configs",
    "tenant_credentials":           "gv_cfg_tenant_credentials",
    "credential_access_logs":       "gv_aud_credential_access_logs",
    "global_default_credentials":   "gv_cfg_global_default_credentials",
    "tenant_audit_sessions":        "gv_aud_tenant_sessions",
    "tenant_audit_logs":            "gv_aud_tenant_logs",
    "tenant_brandings":             "gv_cfg_tenant_brandings",
    "security_policies":            "gv_cfg_security_policies",
    "ip_access_rules":              "gv_cfg_ip_access_rules",
    "data_retention_policies":      "gv_cfg_data_retention_policies",
    "plan_limits":                  "gv_lic_plan_limits",
    "tenant_profiles":              "gv_usr_tenant_profiles",
    "plan_module_access":           "gv_lic_plan_module_access",
    "terminology_overrides":        "gv_cfg_terminology_overrides",
    "verification_otps":            "gv_usr_verification_otps",
    "tenant_versions":              "gv_cfg_tenant_versions",
    "version_backups":              "gv_cfg_version_backups",
    "customer_users":               "gv_usr_customer_users",
    "customer_menu_categories":     "gv_cfg_customer_menu_categories",
    "customer_portal_logs":         "gv_aud_customer_portal_logs",
}

PLATFORM_RENAMES = {
    "master_lookups":               "gv_cfg_master_lookups",
    "lookup_values":                "gv_cfg_lookup_values",
    "packages":                     "gv_lic_packages",
    "error_catalog":                "gv_cfg_error_catalog",
    "error_logs":                   "gv_aud_error_logs",
    "error_auto_report_rules":      "gv_aud_error_auto_report_rules",
    "tenant_usage_details":         "gv_lic_tenant_usage_details",
    "wallets":                      "gv_pay_wallets",
    "wallet_transactions":          "gv_pay_wallet_transactions",
    "recharge_plans":               "gv_pay_recharge_plans",
    "coupons":                      "gv_lic_coupons",
    "software_offers":              "soft_lic_software_offers",
    "license_keys":                 "gv_lic_license_keys",
    "module_definitions":           "gv_cfg_module_definitions",
    "tenant_activity_logs":         "gv_aud_tenant_activity_logs",
    "business_type_registry":       "gv_cfg_business_type_registry",
    "industry_packages":            "gv_cfg_industry_packages",
    "tenant_modules":               "gv_cfg_tenant_modules",
    "marketplace_vendors":          "gv_ven_marketplace_vendors",
    "marketplace_modules":          "gv_mkt_marketplace_modules",
    "marketplace_reviews":          "gv_mkt_marketplace_reviews",
    "tenant_marketplace_modules":   "gv_mkt_tenant_modules",
    "ai_plans":                     "soft_lic_ai_plans",
    "ai_subscriptions":             "soft_lic_ai_subscriptions",
    "ai_subscription_items":        "soft_lic_ai_subscription_items",
    "subscription_packages":        "gv_lic_subscription_packages",
    "coupon_redemptions":           "gv_lic_coupon_redemptions",
    "help_articles":                "gv_doc_help_articles",
    "plugin_registry":              "gv_cfg_plugin_registry",
    "tenant_plugins":               "gv_cfg_tenant_plugins",
    "plugin_hook_logs":             "gv_aud_plugin_hook_logs",
    "marketplace_listings":         "gv_mkt_listings",
    "listing_price_tiers":          "gv_mkt_listing_price_tiers",
    "marketplace_posts":            "gv_mkt_posts",
    "post_engagements":             "gv_mkt_post_engagements",
    "post_comments":                "gv_mkt_post_comments",
    "marketplace_enquiries":        "gv_mkt_enquiries",
    "marketplace_orders":           "gv_mkt_orders",
    "marketplace_order_items":      "gv_mkt_order_items",
    "listing_analytics":            "gv_mkt_listing_analytics",
    "post_analytics":               "gv_mkt_post_analytics",
    "package_modules":              "gv_lic_package_modules",
    "page_registry":                "gv_cfg_page_registry",
    "app_versions":                 "gv_cfg_app_versions",
    "industry_patches":             "gv_cfg_industry_patches",
    "test_environments":            "gv_qa_environments",
    "test_runs":                    "gv_qa_runs",
    "test_results":                 "gv_qa_results",
    "test_groups":                  "gv_qa_groups",
    "test_group_executions":        "gv_qa_group_executions",
    "manual_test_logs":             "gv_qa_manual_logs",
    "scheduled_tests":              "gv_qa_scheduled_tests",
    "scheduled_test_runs":          "gv_qa_scheduled_runs",
    "database_backup_records":      "gv_cfg_db_backup_records",
    "backup_logs":                  "gv_cfg_backup_logs",
    "restore_logs":                 "gv_cfg_restore_logs",
    "test_plans":                   "gv_qa_plans",
    "test_plan_items":              "gv_qa_plan_items",
    "test_evidences":               "gv_qa_evidences",
    "test_error_logs":              "gv_qa_error_logs",
    "test_reports":                 "gv_qa_reports",
    "system_field_master":          "gv_cfg_system_field_master",
}

WORKING_RENAMES = {
    # CRM
    "raw_contacts":                         "gv_crm_raw_contacts",
    "raw_contact_filters":                  "gv_crm_raw_contact_filters",
    "contacts":                             "gv_crm_contacts",
    "contact_filters":                      "gv_crm_contact_filters",
    "organizations":                        "gv_crm_organizations",
    "organization_filters":                 "gv_crm_organization_filters",
    "contact_organizations":                "gv_crm_contact_organizations",
    "communications":                       "gv_crm_communications",
    "leads":                                "gv_crm_leads",
    "lead_filters":                         "gv_crm_lead_filters",
    "activities":                           "gv_crm_activities",
    "demos":                                "gv_crm_demos",
    "tour_plans":                           "gv_crm_tour_plans",
    "entity_owners":                        "gv_crm_entity_owners",
    "ownership_logs":                       "gv_crm_ownership_logs",
    "assignment_rules":                     "gv_crm_assignment_rules",
    "manufacturers":                        "gv_crm_manufacturers",
    "manufacturer_organizations":           "gv_crm_manufacturer_organizations",
    "manufacturer_contacts":                "gv_crm_manufacturer_contacts",
    "organization_locations":               "gv_crm_organization_locations",
    "follow_ups":                           "gv_crm_follow_ups",
    "support_tickets":                      "gv_crm_support_tickets",
    "support_ticket_messages":              "gv_crm_support_ticket_messages",
    "tasks":                                "gv_crm_tasks",
    "task_history":                         "gv_crm_task_history",
    "task_watchers":                        "gv_crm_task_watchers",
    "comments":                             "gv_crm_comments",
    "task_logic_configs":                   "gv_crm_task_logic_configs",
    "scheduled_events":                     "gv_crm_scheduled_events",
    "event_participants":                   "gv_crm_event_participants",
    "event_history":                        "gv_crm_event_history",
    "entity_verification_records":          "gv_crm_entity_verification_records",
    "warranty_templates":                   "gv_crm_warranty_templates",
    "warranty_records":                     "gv_crm_warranty_records",
    "warranty_claims":                      "gv_crm_warranty_claims",
    "amc_plan_templates":                   "gv_crm_amc_plan_templates",
    "amc_contracts":                        "gv_crm_amc_contracts",
    "amc_schedules":                        "gv_crm_amc_schedules",
    "service_visit_logs":                   "gv_crm_service_visit_logs",
    "service_charges":                      "gv_crm_service_charges",
    "recurring_events":                     "gv_crm_recurring_events",
    "tour_plan_visits":                     "gv_crm_tour_plan_visits",
    "tour_plan_photos":                     "gv_crm_tour_plan_photos",
    "calendar_events":                      "gv_crm_calendar_events",
    # Sales
    "quotations":                           "gv_sal_quotations",
    "quotation_line_items":                 "gv_sal_quotation_line_items",
    "quotation_send_logs":                  "gv_sal_quotation_send_logs",
    "quotation_negotiation_logs":           "gv_sal_quotation_negotiation_logs",
    "quotation_activities":                 "gv_sal_quotation_activities",
    "quotation_templates":                  "gv_sal_quotation_templates",
    "sales_targets":                        "gv_sal_targets",
    "sale_orders":                          "gv_sal_orders",
    "sale_order_items":                     "gv_sal_order_items",
    "delivery_challans":                    "gv_sal_delivery_challans",
    "delivery_challan_items":               "gv_sal_delivery_challan_items",
    "sale_returns":                         "gv_sal_returns",
    "sale_return_items":                    "gv_sal_return_items",
    "sale_masters":                         "gv_sal_masters",
    "price_lists":                          "gv_sal_price_lists",
    "price_list_items":                     "gv_sal_price_list_items",
    "service_rates":                        "gv_sal_service_rates",
    # Inventory
    "products":                             "gv_inv_products",
    "product_prices":                       "gv_inv_product_prices",
    "customer_price_groups":                "gv_inv_customer_price_groups",
    "customer_group_mappings":              "gv_inv_customer_group_mappings",
    "product_tax_details":                  "gv_inv_product_tax_details",
    "product_unit_conversions":             "gv_inv_product_unit_conversions",
    "product_relations":                    "gv_inv_product_relations",
    "product_filters":                      "gv_inv_product_filters",
    "inventory_items":                      "gv_inv_items",
    "stock_locations":                      "gv_inv_stock_locations",
    "stock_transactions":                   "gv_inv_stock_transactions",
    "stock_summaries":                      "gv_inv_stock_summaries",
    "stock_adjustments":                    "gv_inv_stock_adjustments",
    "serial_masters":                       "gv_inv_serial_masters",
    "bom_formulas":                         "gv_inv_bom_formulas",
    "bom_formula_items":                    "gv_inv_bom_formula_items",
    "bom_productions":                      "gv_inv_bom_productions",
    "scrap_records":                        "gv_inv_scrap_records",
    "inventory_labels":                     "gv_inv_labels",
    "unit_masters":                         "gv_inv_unit_masters",
    "unit_conversions":                     "gv_inv_unit_conversions",
    "purchase_rfqs":                        "gv_inv_purchase_rfqs",
    "purchase_rfq_items":                   "gv_inv_purchase_rfq_items",
    "purchase_quotations":                  "gv_inv_purchase_quotations",
    "purchase_quotation_items":             "gv_inv_purchase_quotation_items",
    "quotation_comparisons":                "gv_inv_quotation_comparisons",
    "purchase_orders":                      "gv_inv_purchase_orders",
    "purchase_order_items":                 "gv_inv_purchase_order_items",
    "goods_receipts":                       "gv_inv_goods_receipts",
    "goods_receipt_items":                  "gv_inv_goods_receipt_items",
    "purchase_masters":                     "gv_inv_purchase_masters",
    # Accounting
    "invoices":                             "gv_acc_invoices",
    "invoice_line_items":                   "gv_acc_invoice_line_items",
    "proforma_invoices":                    "gv_acc_proforma_invoices",
    "proforma_line_items":                  "gv_acc_proforma_line_items",
    "credit_notes":                         "gv_acc_credit_notes",
    "debit_notes":                          "gv_acc_debit_notes",
    "debit_note_items":                     "gv_acc_debit_note_items",
    "account_groups":                       "gv_acc_account_groups",
    "ledger_masters":                       "gv_acc_ledger_masters",
    "ledger_mappings":                      "gv_acc_ledger_mappings",
    "account_transactions":                 "gv_acc_transactions",
    "bank_accounts":                        "gv_acc_bank_accounts",
    "bank_reconciliations":                 "gv_acc_bank_reconciliations",
    "purchase_invoices":                    "gv_acc_purchase_invoices",
    "purchase_invoice_items":               "gv_acc_purchase_invoice_items",
    "saved_formulas":                       "gv_acc_saved_formulas",
    # Payments
    "payments":                             "gv_pay_payments",
    "payment_receipts":                     "gv_pay_payment_receipts",
    "refunds":                              "gv_pay_refunds",
    "payment_reminders":                    "gv_pay_payment_reminders",
    "payment_records":                      "gv_pay_records",
    # Tax
    "gst_returns":                          "gv_tax_gst_returns",
    "tds_records":                          "gv_tax_tds_records",
    "gst_verification_logs":               "gv_tax_gst_verification_logs",
    # Workflows
    "workflows":                            "gv_wf_workflows",
    "workflow_states":                      "gv_wf_states",
    "workflow_transitions":                 "gv_wf_transitions",
    "workflow_instances":                   "gv_wf_instances",
    "workflow_history":                     "gv_wf_history",
    "workflow_approvals":                   "gv_wf_approvals",
    "workflow_action_logs":                 "gv_wf_action_logs",
    "workflow_sla_escalations":             "gv_wf_sla_escalations",
    "approval_requests":                    "gv_wf_approval_requests",
    "approval_rules":                       "gv_wf_approval_rules",
    # Notifications
    "notifications":                        "gv_not_notifications",
    "notification_preferences":             "gv_not_preferences",
    "notification_templates":               "gv_not_templates",
    "push_subscriptions":                   "gv_not_push_subscriptions",
    "notification_configs":                 "gv_not_configs",
    "escalation_rules":                     "gv_not_escalation_rules",
    "reminders":                            "gv_not_reminders",
    # Reports
    "report_export_logs":                   "gv_rpt_export_logs",
    "report_definitions":                   "gv_rpt_definitions",
    "report_bookmarks":                     "gv_rpt_bookmarks",
    "scheduled_reports":                    "gv_rpt_scheduled_reports",
    "report_templates":                     "gv_rpt_templates",
    # Documents
    "import_profiles":                      "gv_doc_import_profiles",
    "import_jobs":                          "gv_doc_import_jobs",
    "import_rows":                          "gv_doc_import_rows",
    "export_jobs":                          "gv_doc_export_jobs",
    "documents":                            "gv_doc_documents",
    "document_attachments":                 "gv_doc_attachments",
    "document_folders":                     "gv_doc_folders",
    "cloud_connections":                    "gv_doc_cloud_connections",
    "document_share_links":                 "gv_doc_share_links",
    "document_activities":                  "gv_doc_activities",
    "document_templates":                   "gv_doc_templates",
    "tenant_template_customizations":       "gv_doc_tenant_template_customizations",
    # Communications
    "email_accounts":                       "gv_cmn_email_accounts",
    "email_threads":                        "gv_cmn_email_threads",
    "emails":                               "gv_cmn_emails",
    "email_attachments":                    "gv_cmn_email_attachments",
    "email_templates":                      "gv_cmn_email_templates",
    "email_signatures":                     "gv_cmn_email_signatures",
    "email_campaigns":                      "gv_cmn_email_campaigns",
    "campaign_recipients":                  "gv_cmn_campaign_recipients",
    "email_tracking_events":                "gv_cmn_email_tracking_events",
    "email_unsubscribes":                   "gv_cmn_email_unsubscribes",
    "email_footer_templates":               "gv_cmn_email_footer_templates",
    "whatsapp_business_accounts":           "gv_cmn_wa_business_accounts",
    "wa_conversations":                     "gv_cmn_wa_conversations",
    "wa_messages":                          "gv_cmn_wa_messages",
    "wa_templates":                         "gv_cmn_wa_templates",
    "wa_broadcasts":                        "gv_cmn_wa_broadcasts",
    "wa_broadcast_recipients":              "gv_cmn_wa_broadcast_recipients",
    "wa_chatbot_flows":                     "gv_cmn_wa_chatbot_flows",
    "wa_quick_replies":                     "gv_cmn_wa_quick_replies",
    "wa_opt_outs":                          "gv_cmn_wa_opt_outs",
    "communication_logs":                   "gv_cmn_communication_logs",
    # Config
    "brands":                               "gv_cfg_brands",
    "brand_organizations":                  "gv_cfg_brand_organizations",
    "brand_contacts":                       "gv_cfg_brand_contacts",
    "business_locations":                   "gv_cfg_business_locations",
    "company_countries":                    "gv_cfg_company_countries",
    "company_states":                       "gv_cfg_company_states",
    "company_cities":                       "gv_cfg_company_cities",
    "company_pincodes":                     "gv_cfg_company_pincodes",
    "custom_field_definitions":             "gv_cfg_custom_field_definitions",
    "entity_config_values":                 "gv_cfg_entity_config_values",
    "sync_policies":                        "gv_cfg_sync_policies",
    "sync_warning_rules":                   "gv_cfg_sync_warning_rules",
    "sync_devices":                         "gv_cfg_sync_devices",
    "sync_conflicts":                       "gv_cfg_sync_conflicts",
    "sync_flush_commands":                  "gv_cfg_sync_flush_commands",
    "cron_job_configs":                     "gv_cfg_cron_job_configs",
    "business_hours_schedules":             "gv_cfg_business_hours_schedules",
    "holiday_calendars":                    "gv_cfg_holiday_calendars",
    "calendar_highlights":                  "gv_cfg_calendar_highlights",
    "auto_number_sequences":                "gv_cfg_auto_number_sequences",
    "company_profiles":                     "gv_cfg_company_profiles",
    "notion_configs":                       "gv_cfg_notion_configs",
    "api_keys":                             "gv_cfg_api_keys",
    "webhook_endpoints":                    "gv_cfg_webhook_endpoints",
    "webhook_deliveries":                   "gv_cfg_webhook_deliveries",
    "rate_limit_tiers":                     "gv_cfg_rate_limit_tiers",
    "table_configs":                        "gv_cfg_table_configs",
    "data_masking_policies":                "gv_cfg_data_masking_policies",
    "quiet_hour_configs":                   "gv_cfg_quiet_hour_configs",
    "user_calendar_syncs":                  "gv_cfg_user_calendar_syncs",
    "user_availability":                    "gv_cfg_user_availability",
    "blocked_slots":                        "gv_cfg_blocked_slots",
    "calendar_configs":                     "gv_cfg_calendar_configs",
    "google_connections":                   "gv_cfg_google_connections",
    "ai_settings":                          "gv_cfg_ai_settings",
    "ai_models":                            "gv_cfg_ai_models",
    "ai_datasets":                          "gv_cfg_ai_datasets",
    "ai_documents":                         "gv_cfg_ai_documents",
    "ai_training_jobs":                     "gv_cfg_ai_training_jobs",
    "ai_embeddings":                        "gv_cfg_ai_embeddings",
    "ai_chat_sessions":                     "gv_cfg_ai_chat_sessions",
    "ai_chat_messages":                     "gv_cfg_ai_chat_messages",
    "ai_system_prompts":                    "gv_cfg_ai_system_prompts",
    "control_room_rules":                   "gv_cfg_control_room_rules",
    "control_room_values":                  "gv_cfg_control_room_values",
    "control_room_drafts":                  "gv_cfg_control_room_drafts",
    "tenant_rule_cache_versions":           "gv_cfg_rule_cache_versions",
    "saved_filters":                        "gv_cfg_saved_filters",
    "shortcut_definitions":                 "gv_cfg_shortcut_definitions",
    "shortcut_user_overrides":              "gv_cfg_shortcut_user_overrides",
    # Audit
    "sync_change_logs":                     "gv_aud_sync_change_logs",
    "sync_audit_logs":                      "gv_aud_sync_audit_logs",
    "cron_job_run_logs":                    "gv_aud_cron_job_run_logs",
    "api_request_logs":                     "gv_aud_api_request_logs",
    "unmask_audit_logs":                    "gv_aud_unmask_logs",
    "ai_usage_logs":                        "gv_aud_ai_usage_logs",
    "control_room_audit_logs":              "gv_aud_control_room_logs",
}

MARKETPLACE_RENAMES = {
    "mkt_listings":             "gv_mkt_listings",
    "mkt_listing_price_tiers":  "gv_mkt_listing_price_tiers",
    "mkt_posts":                "gv_mkt_posts",
    "mkt_post_engagements":     "gv_mkt_post_engagements",
    "mkt_post_comments":        "gv_mkt_post_comments",
    "mkt_offers":               "gv_mkt_offers",
    "mkt_offer_redemptions":    "gv_mkt_offer_redemptions",
    "mkt_reviews":              "gv_mkt_reviews",
    "mkt_enquiries":            "gv_mkt_enquiries",
    "mkt_analytics_events":     "gv_mkt_analytics_events",
    "mkt_analytics_summaries":  "gv_mkt_analytics_summaries",
    "mkt_follows":              "gv_mkt_follows",
    "mkt_requirement_quotes":   "gv_mkt_requirement_quotes",
}

PLATFORM_CONSOLE_RENAMES = {
    "global_error_logs":        "pc_error_global_logs",
    "customer_error_reports":   "pc_error_customer_reports",
    "error_escalations":        "pc_error_escalations",
    "error_auto_reports":       "pc_error_auto_reports",
    "error_trends":             "pc_error_trends",
    "alert_rules":              "pc_alert_rules",
    "version_releases":         "pc_version_releases",
    "vertical_versions":        "pc_vertical_versions",
    "rollback_logs":            "pc_rollback_logs",
    "vertical_registry":        "pc_vertical_registry",
    "vertical_audits":          "pc_vertical_audits",
    "vertical_health":          "pc_vertical_health",
    "brand_module_whitelists":  "pc_brand_module_whitelists",
    "brand_feature_flags":      "pc_brand_feature_flags",
    "brand_error_summaries":    "pc_brand_error_summaries",
    "health_snapshots":         "pc_health_snapshots",
    "alert_history":            "pc_alert_history",
    "incident_logs":            "pc_incident_logs",
    "notification_logs":        "pc_notification_logs",
    "dr_plans":                 "pc_dr_plans",
    "deployment_logs":          "pc_deployment_logs",
    "pipeline_runs":            "pc_pipeline_runs",
    "build_logs":               "pc_build_logs",
    "global_menu_configs":      "pc_menu_global_configs",
    "brand_menu_overrides":     "pc_menu_brand_overrides",
}

# ─── DB configs ──────────────────────────────────────────────────────────────
DB_HOST = "nozomi.proxy.rlwy.net"
DB_PORT = "35324"
DB_USER = "postgres"

CONFIGS = [
    {
        "label":   "IdentityDB",
        "dbname":  "identitydb",
        "schema":  "prisma/schemas/identity.prisma",
        "renames": IDENTITY_RENAMES,
    },
    {
        "label":   "PlatformDB",
        "dbname":  "platformdb",
        "schema":  "prisma/schemas/platform.prisma",
        "renames": PLATFORM_RENAMES,
    },
    {
        "label":   "WorkingDB",
        "dbname":  "workingdb",
        "schema":  "prisma/schemas/working.prisma",
        "renames": WORKING_RENAMES,
    },
    {
        "label":   "MarketplaceDB",
        "dbname":  "marketplacedb",
        "schema":  "prisma/schemas/marketplace.prisma",
        "renames": MARKETPLACE_RENAMES,
    },
    {
        "label":   "PlatformConsoleDB",
        "dbname":  "platformconsoledb",
        "schema":  "prisma/schemas/platform-console.prisma",
        "renames": PLATFORM_CONSOLE_RENAMES,
    },
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def patch_schema(schema_path: str, renames: dict, apply: bool) -> int:
    """Replace @@map("old") with @@map("new") in schema file. Returns count of replacements."""
    full_path = os.path.join(BASE_DIR, schema_path)
    with open(full_path) as f:
        content = f.read()
    count = 0
    for old, new in renames.items():
        pattern = f'@@map("{old}")'
        replacement = f'@@map("{new}")'
        if pattern in content:
            content = content.replace(pattern, replacement)
            count += 1
    if apply and count > 0:
        with open(full_path, "w") as f:
            f.write(content)
    return count


def generate_sql(dbname: str, renames: dict) -> str:
    """Generate ALTER TABLE SQL for a DB."""
    lines = [f"-- {dbname} renames ({len(renames)} tables)", "BEGIN;"]
    for old, new in renames.items():
        lines.append(f'ALTER TABLE "{old}" RENAME TO "{new}";')
    lines.append("COMMIT;")
    return "\n".join(lines)


def main():
    apply = "--apply" in sys.argv
    mode = "APPLY" if apply else "DRY-RUN"
    print(f"\n{'='*60}")
    print(f"371-Table Naming Rename Sprint [{mode}]")
    print(f"{'='*60}\n")

    total_sql = 0
    total_schema = 0

    for cfg in CONFIGS:
        label = cfg["label"]
        renames = cfg["renames"]
        schema_path = cfg["schema"]
        dbname = cfg["dbname"]

        # Schema patch
        patched = patch_schema(schema_path, renames, apply)

        # SQL generation
        sql = generate_sql(dbname, renames)
        sql_file = os.path.join(BASE_DIR, f"scripts/sql/rename_{dbname}.sql")
        if apply:
            os.makedirs(os.path.dirname(sql_file), exist_ok=True)
            with open(sql_file, "w") as f:
                f.write(sql)

        print(f"[{label}]")
        print(f"  schema patches: {patched}/{len(renames)}")
        print(f"  SQL tables:     {len(renames)}")
        if apply:
            print(f"  schema file:    UPDATED ({schema_path})")
            print(f"  sql file:       WRITTEN (scripts/sql/rename_{dbname}.sql)")
        print()

        total_sql += len(renames)
        total_schema += patched

    print(f"TOTAL: {total_schema} schema patches, {total_sql} SQL renames")
    if not apply:
        print("\nRe-run with --apply to write schema patches and SQL files.")


if __name__ == "__main__":
    main()
