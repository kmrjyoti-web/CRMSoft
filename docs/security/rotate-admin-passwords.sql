-- Security Ticket #8 — Admin Password Rotation
-- Date: 2026-04-23
--
-- INSTRUCTIONS:
-- 1. Replace <BCRYPT_HASH_FOR_ADMIN> with the hash for admin@crm.com
-- 2. Replace <BCRYPT_HASH_FOR_PLATFORM> with the hash for platform@crm.com
-- 3. Connect to IdentityDB:
--      psql "postgresql://postgres:<password>@nozomi.proxy.rlwy.net:35324/identitydb"
-- 4. Run this script
-- 5. Verify results in the SELECT at the bottom
--
-- Generated hashes are in the terminal output from Phase 4 of the security fix.
-- Store new passwords in 1Password / Notion private page — NOT in git.
--
-- Table: gv_usr_users (mapped by Prisma as User model in IdentityDB)
-- Table: gv_usr_super_admins (SuperAdmin model)

BEGIN;

-- Update tenant admin user (admin@crm.com)
UPDATE gv_usr_users
SET
  password = '<BCRYPT_HASH_FOR_ADMIN>',
  updated_at = NOW()
WHERE email = 'admin@crm.com';

-- Update super admin (platform@crm.com)
-- Note: SuperAdmin is a separate table from regular users
UPDATE gv_usr_super_admins
SET
  password = '<BCRYPT_HASH_FOR_PLATFORM>',
  updated_at = NOW()
WHERE email = 'platform@crm.com';

-- Also update sample employee accounts (they share the admin password in seeds)
UPDATE gv_usr_users
SET
  password = '<BCRYPT_HASH_FOR_ADMIN>',
  updated_at = NOW()
WHERE email IN (
  'manager@crm.com',
  'sales1@crm.com',
  'marketing1@crm.com',
  'support1@crm.com'
);

-- Verify
SELECT 'gv_usr_users' AS tbl, email, updated_at
FROM gv_usr_users
WHERE email IN ('admin@crm.com', 'manager@crm.com', 'sales1@crm.com', 'marketing1@crm.com', 'support1@crm.com')
UNION ALL
SELECT 'gv_usr_super_admins', email, updated_at
FROM gv_usr_super_admins
WHERE email = 'platform@crm.com'
ORDER BY tbl, email;

COMMIT;
