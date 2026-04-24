import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { CopyFiltersCommand } from './copy-filters.command';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

@CommandHandler(CopyFiltersCommand)
export class CopyFiltersHandler implements ICommandHandler<CopyFiltersCommand> {
  private readonly logger = new Logger(CopyFiltersHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CopyFiltersCommand): Promise<number> {
    const sourceConfig = ENTITY_FILTER_CONFIG[command.sourceType];
    const targetConfig = ENTITY_FILTER_CONFIG[command.targetType];

    // Get source filters
    const sourceFilters = await (this.prisma[sourceConfig.filterModel] as any).findMany({
      where: { [sourceConfig.fkField]: command.sourceId },
      select: { lookupValueId: true },
    });

    let copied = 0;
    for (const sf of sourceFilters) {
      try {
        await (this.prisma[targetConfig.filterModel] as any).create({
          data: {
            [targetConfig.fkField]: command.targetId,
            lookupValueId: sf.lookupValueId,
          },
        });
        copied++;
      } catch (e: any) {
        if (e.code !== 'P2002') throw e; // skip duplicates
      }
    }

    this.logger.log(
      `Copied ${copied} filters from ${command.sourceType}/${command.sourceId} ? ${command.targetType}/${command.targetId}`,
    );
    return copied;
  }
}
