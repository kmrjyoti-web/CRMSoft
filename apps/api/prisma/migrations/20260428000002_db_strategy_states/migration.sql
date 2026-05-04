-- Add intermediate provisioning states to DbStrategy enum
-- Safe to re-run: ALTER TYPE ADD VALUE is idempotent in PG 14+ when using IF NOT EXISTS

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PROVISIONING'
                 AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'DbStrategy')) THEN
    ALTER TYPE "DbStrategy" ADD VALUE 'PROVISIONING';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MIGRATING'
                 AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'DbStrategy')) THEN
    ALTER TYPE "DbStrategy" ADD VALUE 'MIGRATING';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SEEDING'
                 AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'DbStrategy')) THEN
    ALTER TYPE "DbStrategy" ADD VALUE 'SEEDING';
  END IF;
END $$;
