-- CRMSoft — Initialize all 5 databases on fresh PostgreSQL instance
-- This script runs automatically via docker-entrypoint-initdb.d/

-- Identity DB: Users, Tenants, Auth, Permissions
CREATE DATABASE crmsoft_identity;

-- Platform DB: App versions, modules, lookups, platform config
CREATE DATABASE crmsoft_platform;

-- Working DB: Customer data (contacts, leads, orgs, etc.)
CREATE DATABASE crmsoft_working;

-- Marketplace DB: Listings, offers, orders
CREATE DATABASE crmsoft_marketplace;

-- Default DB (used by Prisma default DATABASE_URL)
-- crmsoft is created by POSTGRES_DB env var in docker-compose

\echo 'CRMSoft databases initialized.'
