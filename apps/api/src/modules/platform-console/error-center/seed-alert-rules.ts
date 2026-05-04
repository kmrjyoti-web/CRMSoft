import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { Logger } from '@nestjs/common';

const DEFAULT_ALERT_RULES = [
  {
    name: 'Critical Error Alert',
    severity: 'CRITICAL',
    condition: {
      type: 'threshold',
      metric: 'error_count',
      value: 1,
      window: '1m',
      filter: { severity: 'CRITICAL' },
    },
    channels: ['EMAIL', 'SMS'],
    isActive: true,
  },
  {
    name: 'Repeated Error (3x/hour)',
    severity: 'HIGH',
    condition: {
      type: 'same_error',
      metric: 'same_error_code',
      value: 3,
      window: '1h',
    },
    channels: ['EMAIL'],
    isActive: true,
  },
  {
    name: 'DB Connection Failure',
    severity: 'CRITICAL',
    condition: {
      type: 'threshold',
      metric: 'error_code',
      value: 1,
      window: '1m',
      filter: { errorCode: 'E_DB_CONN' },
    },
    channels: ['EMAIL', 'SMS'],
    isActive: true,
  },
  {
    name: 'High Error Rate (>10/hour)',
    severity: 'HIGH',
    condition: {
      type: 'threshold',
      metric: 'error_count',
      value: 10,
      window: '1h',
    },
    channels: ['EMAIL'],
    isActive: true,
  },
];

export async function seedDefaultAlertRules(
  db: PlatformConsolePrismaService,
): Promise<void> {
  const logger = new Logger('SeedAlertRules');
  for (const rule of DEFAULT_ALERT_RULES) {
    const existing = await db.alertRule.findFirst({
      where: { name: rule.name },
    });
    if (!existing) {
      await db.alertRule.create({ data: rule });
      logger.log(`Seeded alert rule: ${rule.name}`);
    }
  }
}
