/**
 * Environment Validator — validates all required env vars on app bootstrap.
 * Call validateEnv() at the top of main.ts before NestFactory.create().
 */

interface EnvCheck {
  key: string;
  required: boolean;
  description: string;
}

const ENV_CHECKS: EnvCheck[] = [
  { key: 'DATABASE_URL', required: true, description: 'Default Prisma database connection URL' },
  { key: 'IDENTITY_DATABASE_URL', required: true, description: 'Identity DB (users, tenants, auth)' },
  { key: 'PLATFORM_DATABASE_URL', required: true, description: 'Platform DB (modules, versions, lookups)' },
  { key: 'GLOBAL_WORKING_DATABASE_URL', required: true, description: 'Working DB (customer data)' },
  { key: 'JWT_SECRET', required: true, description: 'JWT signing secret (access tokens)' },
  { key: 'JWT_REFRESH_SECRET', required: true, description: 'JWT refresh token signing secret' },
  { key: 'REDIS_URL', required: false, description: 'Redis connection URL (BullMQ, caching)' },
  { key: 'R2_ACCOUNT_ID', required: false, description: 'Cloudflare R2 account ID (file storage)' },
  { key: 'R2_ACCESS_KEY', required: false, description: 'Cloudflare R2 access key' },
  { key: 'R2_SECRET_KEY', required: false, description: 'Cloudflare R2 secret key' },
  { key: 'NODE_ENV', required: false, description: 'Runtime environment (development/production)' },
  { key: 'PORT', required: false, description: 'API server port (default: 3001)' },
];

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const check of ENV_CHECKS) {
    const value = process.env[check.key];
    if (!value || value.trim() === '') {
      if (check.required) {
        missing.push(`  ✗ ${check.key.padEnd(35)} — ${check.description}`);
      } else {
        warnings.push(`  ⚠ ${check.key.padEnd(35)} — ${check.description} (optional)`);
      }
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('\n[EnvValidator] Optional env vars not set:');
    warnings.forEach((w) => console.warn(w));
  }

  if (missing.length > 0) {
    const message = [
      '',
      '╔═══════════════════════════════════════════════════════════════╗',
      '║  STARTUP FAILED — Missing required environment variables      ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      'The following required environment variables are not set:',
      '',
      ...missing,
      '',
      'Copy API/.env.example to API/.env and fill in the missing values.',
      '',
    ].join('\n');

    throw new Error(message);
  }
}
