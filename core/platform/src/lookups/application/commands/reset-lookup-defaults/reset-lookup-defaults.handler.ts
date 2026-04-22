import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { ResetLookupDefaultsCommand } from './reset-lookup-defaults.command';
import { LOOKUP_SEED_DATA } from '../../../data/lookup-seed-data';

@CommandHandler(ResetLookupDefaultsCommand)
export class ResetLookupDefaultsHandler
  implements ICommandHandler<ResetLookupDefaultsCommand>
{
  private readonly logger = new Logger(ResetLookupDefaultsHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(command: ResetLookupDefaultsCommand) {
    try {
      const tenantId = command.tenantId || '';
      let restoredCount = 0;

      for (const lk of LOOKUP_SEED_DATA) {
        // Upsert the master lookup
        const lookup = await this.prisma!.platform.masterLookup.upsert({
          where: { tenantId_category: { tenantId, category: lk.category } },
          create: {
            tenantId,
            category: lk.category,
            displayName: lk.displayName,
            isSystem: lk.isSystem,
            isActive: true,
          },
          update: {
            displayName: lk.displayName,
            isActive: true,
          },
        });

        // Upsert each value (restore deleted, update existing)
        for (let i = 0; i < lk.values.length; i++) {
          const v = lk.values[i];
          await this.prisma!.platform.lookupValue.upsert({
            where: {
              tenantId_lookupId_value: {
                tenantId,
                lookupId: lookup.id,
                value: v.value,
              },
            },
            create: {
              tenantId,
              lookupId: lookup.id,
              value: v.value,
              label: v.label,
              icon: v.icon || null,
              color: v.color || null,
              rowIndex: i,
              isActive: true,
            },
            update: {
              label: v.label,
              icon: v.icon || null,
              color: v.color || null,
              rowIndex: i,
              isActive: true,
            },
          });
        }

        restoredCount++;
      }

      return { restoredCount };
    } catch (error) {
      this.logger.error(`ResetLookupDefaultsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
