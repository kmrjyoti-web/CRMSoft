import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ReplaceFiltersCommand } from './replace-filters.command';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

/**
 * Replaces ALL filters for an entity (or only for a specific category).
 *
 * Use case 1: Replace all filters → category = undefined
 * Use case 2: Replace only LEAD_TYPE filters → category = 'LEAD_TYPE'
 *   (keeps LEAD_SOURCE, CITY, etc. untouched)
 */
@CommandHandler(ReplaceFiltersCommand)
export class ReplaceFiltersHandler implements ICommandHandler<ReplaceFiltersCommand> {
  private readonly logger = new Logger(ReplaceFiltersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReplaceFiltersCommand): Promise<{ removed: number; assigned: number }> {
    const config = ENTITY_FILTER_CONFIG[command.entityType];

    // Verify entity exists
    const entity = await (this.prisma[config.entityModel] as any).findUnique({
      where: { id: command.entityId },
    });
    if (!entity) {
      throw new NotFoundException(`${command.entityType} ${command.entityId} not found`);
    }

    let deleteWhere: any = { [config.fkField]: command.entityId };

    // If category specified, only remove filters from that category
    if (command.category) {
      const lookup = await this.prisma.platform.masterLookup.findFirst({
        where: { category: command.category.toUpperCase() },
      });
      if (!lookup) throw new NotFoundException(`Category ${command.category} not found`);

      const categoryValueIds = await this.prisma.platform.lookupValue.findMany({
        where: { lookupId: lookup.id },
        select: { id: true },
      });
      deleteWhere.lookupValueId = { in: categoryValueIds.map(v => v.id) };
    }

    // Delete existing
    const deleted = await (this.prisma[config.filterModel] as any).deleteMany({
      where: deleteWhere,
    });

    // Assign new
    const validValues = await this.prisma.platform.lookupValue.findMany({
      where: { id: { in: command.lookupValueIds }, isActive: true },
    });

    let assigned = 0;
    for (const val of validValues) {
      await (this.prisma[config.filterModel] as any).create({
        data: { [config.fkField]: command.entityId, lookupValueId: val.id },
      });
      assigned++;
    }

    this.logger.log(
      `Filters replaced for ${command.entityType}/${command.entityId}: ${deleted.count} removed, ${assigned} assigned`,
    );
    return { removed: deleted.count, assigned };
  }
}
