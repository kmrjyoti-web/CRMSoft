-- Golden Rule #16: Standard Table DNA
-- IdentityDB tables: pc_brand, pc_crm_edition, gv_cfg_partners
-- DO NOT apply directly — run via: psql $IDENTITY_DATABASE_URL -f this_file.sql

-- ─── GvCfgBrand (pc_brand) ───────────────────────────────────────────────────
ALTER TABLE pc_brand ADD COLUMN IF NOT EXISTS partner_code   VARCHAR(50);
ALTER TABLE pc_brand ADD COLUMN IF NOT EXISTS vertical_code  VARCHAR(50);
ALTER TABLE pc_brand ADD COLUMN IF NOT EXISTS multilanguage_json JSONB;
ALTER TABLE pc_brand ADD COLUMN IF NOT EXISTS sort_order     INT NOT NULL DEFAULT 0;

-- ─── GvCfgVertical (pc_crm_edition) ──────────────────────────────────────────
ALTER TABLE pc_crm_edition ADD COLUMN IF NOT EXISTS partner_code        VARCHAR(50);
ALTER TABLE pc_crm_edition ADD COLUMN IF NOT EXISTS brand_code          VARCHAR(50);
ALTER TABLE pc_crm_edition ADD COLUMN IF NOT EXISTS multilanguage_json  JSONB;
ALTER TABLE pc_crm_edition ADD COLUMN IF NOT EXISTS sort_order          INT NOT NULL DEFAULT 0;

-- ─── GvCfgPartner (gv_cfg_partners) ──────────────────────────────────────────
ALTER TABLE gv_cfg_partners ADD COLUMN IF NOT EXISTS brand_code         VARCHAR(50);
ALTER TABLE gv_cfg_partners ADD COLUMN IF NOT EXISTS vertical_code      VARCHAR(50);
ALTER TABLE gv_cfg_partners ADD COLUMN IF NOT EXISTS multilanguage_json JSONB;
ALTER TABLE gv_cfg_partners ADD COLUMN IF NOT EXISTS sort_order         INT NOT NULL DEFAULT 0;
