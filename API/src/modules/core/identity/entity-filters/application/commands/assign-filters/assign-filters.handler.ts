import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AssignFiltersCommand } from './assign-filters.command';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

/**
 * Assigns lookup values as filters to an entity.
 * Skips duplicates — safe to call multiple times.
 */
@CommandHandler(AssignFiltersCommand)
export class AssignFiltersHandler implements ICommandHandler<AssignFiltersCommand> {
  private readonly logger = new Logger(AssignFiltersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AssignFiltersCommand): Promise<{ assigned: number; skipped: number }> {
    const config = ENTITY_FILTER_CONFIG[command.entityType];

    // Verify entity exists
    const entity = await (this.prisma[config.entityModel] as any).findUnique({
      where: { id: command.entityId },
    });
    if (!entity) {
      throw new NotFoundException(`${command.entityType} ${command.entityId} not found`);
    }

    // Verify all lookup values exist
    const values = await this.prisma.lookupValue.findMany({
      where: { id: { in: command.lookupValueIds }, isActive: true },
    });
    const validIds = new Set(values.map(v => v.id));

    let assigned = 0;
    let skipped = 0;

    for (const valueId of command.lookupValueIds) {
      if (!validIds.has(valueId)) {
        skipped++;
        continue;
      }
      try {
        await (this.prisma[config.filterModel] as any).create({
          data: {
            [config.fkField]: command.entityId,
            lookupValueId: valueId,
          },
        });
        assigned++;
      } catch (e: any) {
        // Unique constraint violation → already assigned
        if (e.code === 'P2002') {
          skipped++;
        } else {
          throw e;
        }
      }
    }

    this.logger.log(
      `Filters assigned to ${command.entityType}/${command.entityId}: ${assigned} new, ${skipped} skipped`,
    );
    return { assigned, skipped };
  }
}
