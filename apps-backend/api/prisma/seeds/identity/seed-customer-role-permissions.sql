-- Seed CUSTOMER role with CRM permissions for TRAVEL/DMC vertical
-- Role: CUSTOMER (ae0acdc5-1159-4e32-8627-4a7c9961c800)
-- Run against: identitydb
-- 2026-04-26

INSERT INTO gv_usr_role_permissions (id, tenant_id, role_id, permission_id, is_deleted)
SELECT
  gen_random_uuid()::text,
  '',
  (SELECT id FROM gv_usr_roles WHERE name = 'CUSTOMER' LIMIT 1),
  p.id,
  false
FROM gv_usr_permissions p
WHERE (
  (p.module IN ('activities','calendar','communications','contacts','demos',
                'follow-ups','leads','organizations','quotations','raw_contacts',
                'recurrence','reminders','tour-plans'))
  OR (p.module = 'invoices'        AND p.action IN ('read','create','update','export'))
  OR (p.module = 'payments'        AND p.action IN ('read','create','export'))
  OR (p.module = 'ledgers'         AND p.action IN ('read','export'))
  OR (p.module = 'wallet'          AND p.action IN ('read','create','update'))
  OR (p.module IN ('analytics','dashboard','performance','reports') AND p.action IN ('read','export'))
  OR (p.module IN ('departments','designations','inventory','locations','lookups',
                   'manufacturers','product_pricing','products','trainings')
      AND p.action IN ('read','export'))
  OR (p.module IN ('notifications','settings') AND p.action IN ('read','update'))
  OR (p.module = 'custom_fields'   AND p.action IN ('read','create','update'))
  OR (p.module = 'ownership'       AND p.action IN ('read','create','update','export'))
  OR (p.module = 'support-tickets' AND p.action IN ('read','create','update','export'))
  OR (p.module = 'users'           AND p.action = 'read')
  OR (p.module = 'workflows'       AND p.action = 'read')
)
ON CONFLICT (tenant_id, role_id, permission_id) DO NOTHING;
