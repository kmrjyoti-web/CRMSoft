-- CF-5: Soft Delete + Audit Fields Backfill Migration
-- Generated automatically — adds isDeleted, deletedAt, deletedById, updatedById, updatedByName
-- to all tenant-scoped models that were missing these fields

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "users_is_deleted_idx" ON "users" (is_deleted);

ALTER TABLE "customer_profiles"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "customer_profiles_is_deleted_idx" ON "customer_profiles" (is_deleted);

ALTER TABLE "referral_partners"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "referral_partners_is_deleted_idx" ON "referral_partners" (is_deleted);

ALTER TABLE "departments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "departments_is_deleted_idx" ON "departments" (is_deleted);

ALTER TABLE "designations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "designations_is_deleted_idx" ON "designations" (is_deleted);

ALTER TABLE "roles"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "roles_is_deleted_idx" ON "roles" (is_deleted);

ALTER TABLE "role_permissions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "role_permissions_is_deleted_idx" ON "role_permissions" (is_deleted);

ALTER TABLE "role_menu_permissions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "role_menu_permissions_is_deleted_idx" ON "role_menu_permissions" (is_deleted);

ALTER TABLE "permission_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "permission_templates_is_deleted_idx" ON "permission_templates" (is_deleted);

ALTER TABLE "master_lookups"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "master_lookups_is_deleted_idx" ON "master_lookups" (is_deleted);

ALTER TABLE "lookup_values"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "lookup_values_is_deleted_idx" ON "lookup_values" (is_deleted);

ALTER TABLE "raw_contacts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "raw_contacts_is_deleted_idx" ON "raw_contacts" (is_deleted);

ALTER TABLE "raw_contact_filters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "raw_contact_filters_is_deleted_idx" ON "raw_contact_filters" (is_deleted);

ALTER TABLE "contacts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "contacts_is_deleted_idx" ON "contacts" (is_deleted);

ALTER TABLE "contact_filters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "contact_filters_is_deleted_idx" ON "contact_filters" (is_deleted);

ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "organizations_is_deleted_idx" ON "organizations" (is_deleted);

ALTER TABLE "organization_filters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "organization_filters_is_deleted_idx" ON "organization_filters" (is_deleted);

ALTER TABLE "contact_organizations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "contact_organizations_is_deleted_idx" ON "contact_organizations" (is_deleted);

ALTER TABLE "communications"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "communications_is_deleted_idx" ON "communications" (is_deleted);

ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "leads_is_deleted_idx" ON "leads" (is_deleted);

ALTER TABLE "lead_filters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "lead_filters_is_deleted_idx" ON "lead_filters" (is_deleted);

ALTER TABLE "activities"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "activities_is_deleted_idx" ON "activities" (is_deleted);

ALTER TABLE "demos"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "demos_is_deleted_idx" ON "demos" (is_deleted);

ALTER TABLE "tour_plans"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tour_plans_is_deleted_idx" ON "tour_plans" (is_deleted);

ALTER TABLE "quotations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotations_is_deleted_idx" ON "quotations" (is_deleted);

ALTER TABLE "quotation_line_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_line_items_is_deleted_idx" ON "quotation_line_items" (is_deleted);

ALTER TABLE "quotation_send_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_send_logs_is_deleted_idx" ON "quotation_send_logs" (is_deleted);

ALTER TABLE "quotation_negotiation_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_negotiation_logs_is_deleted_idx" ON "quotation_negotiation_logs" (is_deleted);

ALTER TABLE "quotation_activities"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_activities_is_deleted_idx" ON "quotation_activities" (is_deleted);

ALTER TABLE "quotation_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_templates_is_deleted_idx" ON "quotation_templates" (is_deleted);

ALTER TABLE "entity_owners"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "entity_owners_is_deleted_idx" ON "entity_owners" (is_deleted);

ALTER TABLE "ownership_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ownership_logs_is_deleted_idx" ON "ownership_logs" (is_deleted);

ALTER TABLE "assignment_rules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "assignment_rules_is_deleted_idx" ON "assignment_rules" (is_deleted);

ALTER TABLE "user_capacities"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "user_capacities_is_deleted_idx" ON "user_capacities" (is_deleted);

ALTER TABLE "delegation_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "delegation_records_is_deleted_idx" ON "delegation_records" (is_deleted);

ALTER TABLE "user_permission_overrides"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "user_permission_overrides_is_deleted_idx" ON "user_permission_overrides" (is_deleted);

ALTER TABLE "approval_requests"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "approval_requests_is_deleted_idx" ON "approval_requests" (is_deleted);

ALTER TABLE "approval_rules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "approval_rules_is_deleted_idx" ON "approval_rules" (is_deleted);

ALTER TABLE "menus"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "menus_is_deleted_idx" ON "menus" (is_deleted);

ALTER TABLE "brands"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "brands_is_deleted_idx" ON "brands" (is_deleted);

ALTER TABLE "brand_organizations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "brand_organizations_is_deleted_idx" ON "brand_organizations" (is_deleted);

ALTER TABLE "brand_contacts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "brand_contacts_is_deleted_idx" ON "brand_contacts" (is_deleted);

ALTER TABLE "packages"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "packages_is_deleted_idx" ON "packages" (is_deleted);

ALTER TABLE "manufacturers"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "manufacturers_is_deleted_idx" ON "manufacturers" (is_deleted);

ALTER TABLE "manufacturer_organizations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "manufacturer_organizations_is_deleted_idx" ON "manufacturer_organizations" (is_deleted);

ALTER TABLE "manufacturer_contacts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "manufacturer_contacts_is_deleted_idx" ON "manufacturer_contacts" (is_deleted);

ALTER TABLE "business_locations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "business_locations_is_deleted_idx" ON "business_locations" (is_deleted);

ALTER TABLE "organization_locations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "organization_locations_is_deleted_idx" ON "organization_locations" (is_deleted);

ALTER TABLE "company_countries"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "company_countries_is_deleted_idx" ON "company_countries" (is_deleted);

ALTER TABLE "company_states"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "company_states_is_deleted_idx" ON "company_states" (is_deleted);

ALTER TABLE "company_cities"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "company_cities_is_deleted_idx" ON "company_cities" (is_deleted);

ALTER TABLE "company_pincodes"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "company_pincodes_is_deleted_idx" ON "company_pincodes" (is_deleted);

ALTER TABLE "custom_field_definitions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "custom_field_definitions_is_deleted_idx" ON "custom_field_definitions" (is_deleted);

ALTER TABLE "entity_config_values"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "entity_config_values_is_deleted_idx" ON "entity_config_values" (is_deleted);

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "products_is_deleted_idx" ON "products" (is_deleted);

ALTER TABLE "product_prices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "product_prices_is_deleted_idx" ON "product_prices" (is_deleted);

ALTER TABLE "customer_price_groups"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "customer_price_groups_is_deleted_idx" ON "customer_price_groups" (is_deleted);

ALTER TABLE "customer_group_mappings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "customer_group_mappings_is_deleted_idx" ON "customer_group_mappings" (is_deleted);

ALTER TABLE "product_tax_details"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "product_tax_details_is_deleted_idx" ON "product_tax_details" (is_deleted);

ALTER TABLE "product_unit_conversions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "product_unit_conversions_is_deleted_idx" ON "product_unit_conversions" (is_deleted);

ALTER TABLE "product_relations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "product_relations_is_deleted_idx" ON "product_relations" (is_deleted);

ALTER TABLE "product_filters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "product_filters_is_deleted_idx" ON "product_filters" (is_deleted);

ALTER TABLE "workflows"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflows_is_deleted_idx" ON "workflows" (is_deleted);

ALTER TABLE "workflow_states"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_states_is_deleted_idx" ON "workflow_states" (is_deleted);

ALTER TABLE "workflow_transitions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_transitions_is_deleted_idx" ON "workflow_transitions" (is_deleted);

ALTER TABLE "workflow_instances"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_instances_is_deleted_idx" ON "workflow_instances" (is_deleted);

ALTER TABLE "workflow_history"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_history_is_deleted_idx" ON "workflow_history" (is_deleted);

ALTER TABLE "workflow_approvals"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_approvals_is_deleted_idx" ON "workflow_approvals" (is_deleted);

ALTER TABLE "workflow_action_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_action_logs_is_deleted_idx" ON "workflow_action_logs" (is_deleted);

ALTER TABLE "workflow_sla_escalations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "workflow_sla_escalations_is_deleted_idx" ON "workflow_sla_escalations" (is_deleted);

ALTER TABLE "follow_ups"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "follow_ups_is_deleted_idx" ON "follow_ups" (is_deleted);

ALTER TABLE "reminders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "reminders_is_deleted_idx" ON "reminders" (is_deleted);

ALTER TABLE "recurring_events"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "recurring_events_is_deleted_idx" ON "recurring_events" (is_deleted);

ALTER TABLE "tour_plan_visits"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tour_plan_visits_is_deleted_idx" ON "tour_plan_visits" (is_deleted);

ALTER TABLE "tour_plan_photos"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tour_plan_photos_is_deleted_idx" ON "tour_plan_photos" (is_deleted);

ALTER TABLE "calendar_events"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "calendar_events_is_deleted_idx" ON "calendar_events" (is_deleted);

ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "notifications_is_deleted_idx" ON "notifications" (is_deleted);

ALTER TABLE "notification_preferences"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "notification_preferences_is_deleted_idx" ON "notification_preferences" (is_deleted);

ALTER TABLE "notification_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "notification_templates_is_deleted_idx" ON "notification_templates" (is_deleted);

ALTER TABLE "push_subscriptions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "push_subscriptions_is_deleted_idx" ON "push_subscriptions" (is_deleted);

ALTER TABLE "sales_targets"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sales_targets_is_deleted_idx" ON "sales_targets" (is_deleted);

ALTER TABLE "report_export_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "report_export_logs_is_deleted_idx" ON "report_export_logs" (is_deleted);

ALTER TABLE "report_definitions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "report_definitions_is_deleted_idx" ON "report_definitions" (is_deleted);

ALTER TABLE "report_bookmarks"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "report_bookmarks_is_deleted_idx" ON "report_bookmarks" (is_deleted);

ALTER TABLE "scheduled_reports"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "scheduled_reports_is_deleted_idx" ON "scheduled_reports" (is_deleted);

ALTER TABLE "report_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "report_templates_is_deleted_idx" ON "report_templates" (is_deleted);

ALTER TABLE "audit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "audit_logs_is_deleted_idx" ON "audit_logs" (is_deleted);

ALTER TABLE "audit_field_changes"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "audit_field_changes_is_deleted_idx" ON "audit_field_changes" (is_deleted);

ALTER TABLE "audit_retention_policies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "audit_retention_policies_is_deleted_idx" ON "audit_retention_policies" (is_deleted);

ALTER TABLE "import_profiles"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "import_profiles_is_deleted_idx" ON "import_profiles" (is_deleted);

ALTER TABLE "import_jobs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "import_jobs_is_deleted_idx" ON "import_jobs" (is_deleted);

ALTER TABLE "import_rows"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "import_rows_is_deleted_idx" ON "import_rows" (is_deleted);

ALTER TABLE "export_jobs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "export_jobs_is_deleted_idx" ON "export_jobs" (is_deleted);

ALTER TABLE "documents"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "documents_is_deleted_idx" ON "documents" (is_deleted);

ALTER TABLE "document_attachments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "document_attachments_is_deleted_idx" ON "document_attachments" (is_deleted);

ALTER TABLE "document_folders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "document_folders_is_deleted_idx" ON "document_folders" (is_deleted);

ALTER TABLE "cloud_connections"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "cloud_connections_is_deleted_idx" ON "cloud_connections" (is_deleted);

ALTER TABLE "document_share_links"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "document_share_links_is_deleted_idx" ON "document_share_links" (is_deleted);

ALTER TABLE "document_activities"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "document_activities_is_deleted_idx" ON "document_activities" (is_deleted);

ALTER TABLE "email_accounts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_accounts_is_deleted_idx" ON "email_accounts" (is_deleted);

ALTER TABLE "email_threads"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_threads_is_deleted_idx" ON "email_threads" (is_deleted);

ALTER TABLE "emails"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "emails_is_deleted_idx" ON "emails" (is_deleted);

ALTER TABLE "email_attachments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_attachments_is_deleted_idx" ON "email_attachments" (is_deleted);

ALTER TABLE "email_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_templates_is_deleted_idx" ON "email_templates" (is_deleted);

ALTER TABLE "email_signatures"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_signatures_is_deleted_idx" ON "email_signatures" (is_deleted);

ALTER TABLE "email_campaigns"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_campaigns_is_deleted_idx" ON "email_campaigns" (is_deleted);

ALTER TABLE "campaign_recipients"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "campaign_recipients_is_deleted_idx" ON "campaign_recipients" (is_deleted);

ALTER TABLE "email_tracking_events"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_tracking_events_is_deleted_idx" ON "email_tracking_events" (is_deleted);

ALTER TABLE "email_unsubscribes"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_unsubscribes_is_deleted_idx" ON "email_unsubscribes" (is_deleted);

ALTER TABLE "whatsapp_business_accounts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "whatsapp_business_accounts_is_deleted_idx" ON "whatsapp_business_accounts" (is_deleted);

ALTER TABLE "wa_conversations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_conversations_is_deleted_idx" ON "wa_conversations" (is_deleted);

ALTER TABLE "wa_messages"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_messages_is_deleted_idx" ON "wa_messages" (is_deleted);

ALTER TABLE "wa_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_templates_is_deleted_idx" ON "wa_templates" (is_deleted);

ALTER TABLE "wa_broadcasts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_broadcasts_is_deleted_idx" ON "wa_broadcasts" (is_deleted);

ALTER TABLE "wa_broadcast_recipients"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_broadcast_recipients_is_deleted_idx" ON "wa_broadcast_recipients" (is_deleted);

ALTER TABLE "wa_chatbot_flows"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_chatbot_flows_is_deleted_idx" ON "wa_chatbot_flows" (is_deleted);

ALTER TABLE "wa_quick_replies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_quick_replies_is_deleted_idx" ON "wa_quick_replies" (is_deleted);

ALTER TABLE "wa_opt_outs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wa_opt_outs_is_deleted_idx" ON "wa_opt_outs" (is_deleted);

ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "subscriptions_is_deleted_idx" ON "subscriptions" (is_deleted);

ALTER TABLE "tenant_invoices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_invoices_is_deleted_idx" ON "tenant_invoices" (is_deleted);

ALTER TABLE "tenant_usage"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_usage_is_deleted_idx" ON "tenant_usage" (is_deleted);

ALTER TABLE "sync_policies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_policies_is_deleted_idx" ON "sync_policies" (is_deleted);

ALTER TABLE "sync_warning_rules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_warning_rules_is_deleted_idx" ON "sync_warning_rules" (is_deleted);

ALTER TABLE "sync_devices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_devices_is_deleted_idx" ON "sync_devices" (is_deleted);

ALTER TABLE "sync_conflicts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_conflicts_is_deleted_idx" ON "sync_conflicts" (is_deleted);

ALTER TABLE "sync_flush_commands"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_flush_commands_is_deleted_idx" ON "sync_flush_commands" (is_deleted);

ALTER TABLE "sync_change_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_change_logs_is_deleted_idx" ON "sync_change_logs" (is_deleted);

ALTER TABLE "sync_audit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sync_audit_logs_is_deleted_idx" ON "sync_audit_logs" (is_deleted);

ALTER TABLE "tenant_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_configs_is_deleted_idx" ON "tenant_configs" (is_deleted);

ALTER TABLE "tenant_credentials"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_credentials_is_deleted_idx" ON "tenant_credentials" (is_deleted);

ALTER TABLE "credential_access_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "credential_access_logs_is_deleted_idx" ON "credential_access_logs" (is_deleted);

ALTER TABLE "cron_job_run_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "cron_job_run_logs_is_deleted_idx" ON "cron_job_run_logs" (is_deleted);

ALTER TABLE "error_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "error_logs_is_deleted_idx" ON "error_logs" (is_deleted);

ALTER TABLE "error_auto_report_rules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "error_auto_report_rules_is_deleted_idx" ON "error_auto_report_rules" (is_deleted);

ALTER TABLE "tenant_audit_sessions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_audit_sessions_is_deleted_idx" ON "tenant_audit_sessions" (is_deleted);

ALTER TABLE "tenant_audit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_audit_logs_is_deleted_idx" ON "tenant_audit_logs" (is_deleted);

ALTER TABLE "support_tickets"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "support_tickets_is_deleted_idx" ON "support_tickets" (is_deleted);

ALTER TABLE "tenant_brandings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_brandings_is_deleted_idx" ON "tenant_brandings" (is_deleted);

ALTER TABLE "business_hours_schedules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "business_hours_schedules_is_deleted_idx" ON "business_hours_schedules" (is_deleted);

ALTER TABLE "holiday_calendars"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "holiday_calendars_is_deleted_idx" ON "holiday_calendars" (is_deleted);

ALTER TABLE "calendar_highlights"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "calendar_highlights_is_deleted_idx" ON "calendar_highlights" (is_deleted);

ALTER TABLE "auto_number_sequences"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "auto_number_sequences_is_deleted_idx" ON "auto_number_sequences" (is_deleted);

ALTER TABLE "company_profiles"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "company_profiles_is_deleted_idx" ON "company_profiles" (is_deleted);

ALTER TABLE "security_policies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "security_policies_is_deleted_idx" ON "security_policies" (is_deleted);

ALTER TABLE "data_retention_policies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "data_retention_policies_is_deleted_idx" ON "data_retention_policies" (is_deleted);

ALTER TABLE "email_footer_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "email_footer_templates_is_deleted_idx" ON "email_footer_templates" (is_deleted);

ALTER TABLE "notion_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "notion_configs_is_deleted_idx" ON "notion_configs" (is_deleted);

ALTER TABLE "invoices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "invoices_is_deleted_idx" ON "invoices" (is_deleted);

ALTER TABLE "invoice_line_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "invoice_line_items_is_deleted_idx" ON "invoice_line_items" (is_deleted);

ALTER TABLE "proforma_invoices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "proforma_invoices_is_deleted_idx" ON "proforma_invoices" (is_deleted);

ALTER TABLE "proforma_line_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "proforma_line_items_is_deleted_idx" ON "proforma_line_items" (is_deleted);

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "payments_is_deleted_idx" ON "payments" (is_deleted);

ALTER TABLE "payment_receipts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "payment_receipts_is_deleted_idx" ON "payment_receipts" (is_deleted);

ALTER TABLE "refunds"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "refunds_is_deleted_idx" ON "refunds" (is_deleted);

ALTER TABLE "credit_notes"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "credit_notes_is_deleted_idx" ON "credit_notes" (is_deleted);

ALTER TABLE "payment_reminders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "payment_reminders_is_deleted_idx" ON "payment_reminders" (is_deleted);

ALTER TABLE "api_keys"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "api_keys_is_deleted_idx" ON "api_keys" (is_deleted);

ALTER TABLE "api_request_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "api_request_logs_is_deleted_idx" ON "api_request_logs" (is_deleted);

ALTER TABLE "webhook_endpoints"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "webhook_endpoints_is_deleted_idx" ON "webhook_endpoints" (is_deleted);

ALTER TABLE "webhook_deliveries"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "webhook_deliveries_is_deleted_idx" ON "webhook_deliveries" (is_deleted);

ALTER TABLE "table_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "table_configs_is_deleted_idx" ON "table_configs" (is_deleted);

ALTER TABLE "data_masking_policies"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "data_masking_policies_is_deleted_idx" ON "data_masking_policies" (is_deleted);

ALTER TABLE "unmask_audit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "unmask_audit_logs_is_deleted_idx" ON "unmask_audit_logs" (is_deleted);

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE "task_history"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "task_history_is_deleted_idx" ON "task_history" (is_deleted);

ALTER TABLE "comments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "comments_is_deleted_idx" ON "comments" (is_deleted);

ALTER TABLE "notification_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "notification_configs_is_deleted_idx" ON "notification_configs" (is_deleted);

ALTER TABLE "escalation_rules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "escalation_rules_is_deleted_idx" ON "escalation_rules" (is_deleted);

ALTER TABLE "communication_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "communication_logs_is_deleted_idx" ON "communication_logs" (is_deleted);

ALTER TABLE "task_logic_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "task_logic_configs_is_deleted_idx" ON "task_logic_configs" (is_deleted);

ALTER TABLE "quiet_hour_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quiet_hour_configs_is_deleted_idx" ON "quiet_hour_configs" (is_deleted);

ALTER TABLE "scheduled_events"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "scheduled_events_is_deleted_idx" ON "scheduled_events" (is_deleted);

ALTER TABLE "event_participants"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "event_participants_is_deleted_idx" ON "event_participants" (is_deleted);

ALTER TABLE "event_history"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "event_history_is_deleted_idx" ON "event_history" (is_deleted);

ALTER TABLE "user_calendar_syncs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "user_calendar_syncs_is_deleted_idx" ON "user_calendar_syncs" (is_deleted);

ALTER TABLE "user_availability"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "user_availability_is_deleted_idx" ON "user_availability" (is_deleted);

ALTER TABLE "blocked_slots"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "blocked_slots_is_deleted_idx" ON "blocked_slots" (is_deleted);

ALTER TABLE "calendar_configs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "calendar_configs_is_deleted_idx" ON "calendar_configs" (is_deleted);

ALTER TABLE "google_connections"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "google_connections_is_deleted_idx" ON "google_connections" (is_deleted);

ALTER TABLE "ai_usage_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_usage_logs_is_deleted_idx" ON "ai_usage_logs" (is_deleted);

ALTER TABLE "ai_settings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_settings_is_deleted_idx" ON "ai_settings" (is_deleted);

ALTER TABLE "tenant_usage_details"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_usage_details_is_deleted_idx" ON "tenant_usage_details" (is_deleted);

ALTER TABLE "wallets"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wallets_is_deleted_idx" ON "wallets" (is_deleted);

ALTER TABLE "wallet_transactions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "wallet_transactions_is_deleted_idx" ON "wallet_transactions" (is_deleted);

ALTER TABLE "tenant_profiles"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_profiles_is_deleted_idx" ON "tenant_profiles" (is_deleted);

ALTER TABLE "license_keys"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "license_keys_is_deleted_idx" ON "license_keys" (is_deleted);

ALTER TABLE "tenant_activity_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_activity_logs_is_deleted_idx" ON "tenant_activity_logs" (is_deleted);

ALTER TABLE "terminology_overrides"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "terminology_overrides_is_deleted_idx" ON "terminology_overrides" (is_deleted);

ALTER TABLE "tenant_modules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_modules_is_deleted_idx" ON "tenant_modules" (is_deleted);

ALTER TABLE "marketplace_reviews"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "marketplace_reviews_is_deleted_idx" ON "marketplace_reviews" (is_deleted);

ALTER TABLE "tenant_marketplace_modules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_marketplace_modules_is_deleted_idx" ON "tenant_marketplace_modules" (is_deleted);

ALTER TABLE "coupon_redemptions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "coupon_redemptions_is_deleted_idx" ON "coupon_redemptions" (is_deleted);

ALTER TABLE "tenant_plugins"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_plugins_is_deleted_idx" ON "tenant_plugins" (is_deleted);

ALTER TABLE "plugin_hook_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "plugin_hook_logs_is_deleted_idx" ON "plugin_hook_logs" (is_deleted);

ALTER TABLE "verification_otps"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "verification_otps_is_deleted_idx" ON "verification_otps" (is_deleted);

ALTER TABLE "gst_verification_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "gst_verification_logs_is_deleted_idx" ON "gst_verification_logs" (is_deleted);

ALTER TABLE "marketplace_listings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "marketplace_listings_is_deleted_idx" ON "marketplace_listings" (is_deleted);

ALTER TABLE "marketplace_posts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "marketplace_posts_is_deleted_idx" ON "marketplace_posts" (is_deleted);

ALTER TABLE "post_engagements"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "post_engagements_is_deleted_idx" ON "post_engagements" (is_deleted);

ALTER TABLE "post_comments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "post_comments_is_deleted_idx" ON "post_comments" (is_deleted);

ALTER TABLE "marketplace_enquiries"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "marketplace_enquiries_is_deleted_idx" ON "marketplace_enquiries" (is_deleted);

ALTER TABLE "marketplace_orders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "marketplace_orders_is_deleted_idx" ON "marketplace_orders" (is_deleted);

ALTER TABLE "tenant_versions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_versions_is_deleted_idx" ON "tenant_versions" (is_deleted);

ALTER TABLE "document_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "document_templates_is_deleted_idx" ON "document_templates" (is_deleted);

ALTER TABLE "tenant_template_customizations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_template_customizations_is_deleted_idx" ON "tenant_template_customizations" (is_deleted);

ALTER TABLE "saved_formulas"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "saved_formulas_is_deleted_idx" ON "saved_formulas" (is_deleted);

ALTER TABLE "inventory_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "inventory_items_is_deleted_idx" ON "inventory_items" (is_deleted);

ALTER TABLE "stock_locations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "stock_locations_is_deleted_idx" ON "stock_locations" (is_deleted);

ALTER TABLE "stock_transactions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "stock_transactions_is_deleted_idx" ON "stock_transactions" (is_deleted);

ALTER TABLE "stock_summaries"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "stock_summaries_is_deleted_idx" ON "stock_summaries" (is_deleted);

ALTER TABLE "stock_adjustments"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "stock_adjustments_is_deleted_idx" ON "stock_adjustments" (is_deleted);

ALTER TABLE "serial_masters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "serial_masters_is_deleted_idx" ON "serial_masters" (is_deleted);

ALTER TABLE "bom_formulas"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "bom_formulas_is_deleted_idx" ON "bom_formulas" (is_deleted);

ALTER TABLE "bom_formula_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "bom_formula_items_is_deleted_idx" ON "bom_formula_items" (is_deleted);

ALTER TABLE "bom_productions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "bom_productions_is_deleted_idx" ON "bom_productions" (is_deleted);

ALTER TABLE "scrap_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "scrap_records_is_deleted_idx" ON "scrap_records" (is_deleted);

ALTER TABLE "unit_masters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "unit_masters_is_deleted_idx" ON "unit_masters" (is_deleted);

ALTER TABLE "unit_conversions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "unit_conversions_is_deleted_idx" ON "unit_conversions" (is_deleted);

ALTER TABLE "purchase_rfqs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_rfqs_is_deleted_idx" ON "purchase_rfqs" (is_deleted);

ALTER TABLE "purchase_rfq_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_rfq_items_is_deleted_idx" ON "purchase_rfq_items" (is_deleted);

ALTER TABLE "purchase_quotations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_quotations_is_deleted_idx" ON "purchase_quotations" (is_deleted);

ALTER TABLE "purchase_quotation_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_quotation_items_is_deleted_idx" ON "purchase_quotation_items" (is_deleted);

ALTER TABLE "quotation_comparisons"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "quotation_comparisons_is_deleted_idx" ON "quotation_comparisons" (is_deleted);

ALTER TABLE "purchase_orders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_orders_is_deleted_idx" ON "purchase_orders" (is_deleted);

ALTER TABLE "purchase_order_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_order_items_is_deleted_idx" ON "purchase_order_items" (is_deleted);

ALTER TABLE "goods_receipts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "goods_receipts_is_deleted_idx" ON "goods_receipts" (is_deleted);

ALTER TABLE "goods_receipt_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "goods_receipt_items_is_deleted_idx" ON "goods_receipt_items" (is_deleted);

ALTER TABLE "purchase_invoices"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_invoices_is_deleted_idx" ON "purchase_invoices" (is_deleted);

ALTER TABLE "purchase_invoice_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_invoice_items_is_deleted_idx" ON "purchase_invoice_items" (is_deleted);

ALTER TABLE "ledger_masters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ledger_masters_is_deleted_idx" ON "ledger_masters" (is_deleted);

ALTER TABLE "ledger_mappings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ledger_mappings_is_deleted_idx" ON "ledger_mappings" (is_deleted);

ALTER TABLE "account_transactions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "account_transactions_is_deleted_idx" ON "account_transactions" (is_deleted);

ALTER TABLE "payment_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "payment_records_is_deleted_idx" ON "payment_records" (is_deleted);

ALTER TABLE "bank_accounts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "bank_accounts_is_deleted_idx" ON "bank_accounts" (is_deleted);

ALTER TABLE "bank_reconciliations"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "bank_reconciliations_is_deleted_idx" ON "bank_reconciliations" (is_deleted);

ALTER TABLE "gst_returns"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "gst_returns_is_deleted_idx" ON "gst_returns" (is_deleted);

ALTER TABLE "tds_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tds_records_is_deleted_idx" ON "tds_records" (is_deleted);

ALTER TABLE "sale_orders"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sale_orders_is_deleted_idx" ON "sale_orders" (is_deleted);

ALTER TABLE "sale_order_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sale_order_items_is_deleted_idx" ON "sale_order_items" (is_deleted);

ALTER TABLE "delivery_challans"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "delivery_challans_is_deleted_idx" ON "delivery_challans" (is_deleted);

ALTER TABLE "delivery_challan_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "delivery_challan_items_is_deleted_idx" ON "delivery_challan_items" (is_deleted);

ALTER TABLE "sale_returns"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sale_returns_is_deleted_idx" ON "sale_returns" (is_deleted);

ALTER TABLE "sale_return_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sale_return_items_is_deleted_idx" ON "sale_return_items" (is_deleted);

ALTER TABLE "debit_notes"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "debit_notes_is_deleted_idx" ON "debit_notes" (is_deleted);

ALTER TABLE "debit_note_items"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "debit_note_items_is_deleted_idx" ON "debit_note_items" (is_deleted);

ALTER TABLE "account_groups"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "account_groups_is_deleted_idx" ON "account_groups" (is_deleted);

ALTER TABLE "sale_masters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "sale_masters_is_deleted_idx" ON "sale_masters" (is_deleted);

ALTER TABLE "purchase_masters"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "purchase_masters_is_deleted_idx" ON "purchase_masters" (is_deleted);

ALTER TABLE "shortcut_definitions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "shortcut_definitions_is_deleted_idx" ON "shortcut_definitions" (is_deleted);

ALTER TABLE "shortcut_user_overrides"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "shortcut_user_overrides_is_deleted_idx" ON "shortcut_user_overrides" (is_deleted);

ALTER TABLE "entity_verification_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "entity_verification_records_is_deleted_idx" ON "entity_verification_records" (is_deleted);

ALTER TABLE "warranty_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "warranty_templates_is_deleted_idx" ON "warranty_templates" (is_deleted);

ALTER TABLE "warranty_records"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "warranty_records_is_deleted_idx" ON "warranty_records" (is_deleted);

ALTER TABLE "warranty_claims"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "warranty_claims_is_deleted_idx" ON "warranty_claims" (is_deleted);

ALTER TABLE "amc_plan_templates"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "amc_plan_templates_is_deleted_idx" ON "amc_plan_templates" (is_deleted);

ALTER TABLE "amc_contracts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "amc_contracts_is_deleted_idx" ON "amc_contracts" (is_deleted);

ALTER TABLE "amc_schedules"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "amc_schedules_is_deleted_idx" ON "amc_schedules" (is_deleted);

ALTER TABLE "service_visit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "service_visit_logs_is_deleted_idx" ON "service_visit_logs" (is_deleted);

ALTER TABLE "service_charges"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "service_charges_is_deleted_idx" ON "service_charges" (is_deleted);

ALTER TABLE "ai_models"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_models_is_deleted_idx" ON "ai_models" (is_deleted);

ALTER TABLE "ai_datasets"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_datasets_is_deleted_idx" ON "ai_datasets" (is_deleted);

ALTER TABLE "ai_documents"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_documents_is_deleted_idx" ON "ai_documents" (is_deleted);

ALTER TABLE "ai_training_jobs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_training_jobs_is_deleted_idx" ON "ai_training_jobs" (is_deleted);

ALTER TABLE "ai_embeddings"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_embeddings_is_deleted_idx" ON "ai_embeddings" (is_deleted);

ALTER TABLE "ai_chat_sessions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_chat_sessions_is_deleted_idx" ON "ai_chat_sessions" (is_deleted);

ALTER TABLE "ai_chat_messages"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_chat_messages_is_deleted_idx" ON "ai_chat_messages" (is_deleted);

ALTER TABLE "ai_system_prompts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "ai_system_prompts_is_deleted_idx" ON "ai_system_prompts" (is_deleted);

ALTER TABLE "control_room_values"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "control_room_values_is_deleted_idx" ON "control_room_values" (is_deleted);

ALTER TABLE "control_room_audit_logs"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "control_room_audit_logs_is_deleted_idx" ON "control_room_audit_logs" (is_deleted);

ALTER TABLE "tenant_rule_cache_versions"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "tenant_rule_cache_versions_is_deleted_idx" ON "tenant_rule_cache_versions" (is_deleted);

ALTER TABLE "control_room_drafts"
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
CREATE INDEX IF NOT EXISTS "control_room_drafts_is_deleted_idx" ON "control_room_drafts" (is_deleted);
