import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveFilterCommand } from './remove-filter.command';
import { ENTITY_FILTER_CONFIG } from '../../../entity-filter.types';

@CommandHandler(RemoveFilterCommand)
export class RemoveFilterHandler implements ICommandHandler<RemoveFilterCommand> {
  private readonly logger = new Logger(RemoveFilterHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveFilterCommand): Promise<void> {
    const config = ENTITY_FILTER_CONFIG[command.entityType];

    await (this.prisma[config.filterModel] as any).deleteMany({
      where: {
        [config.fkField]: command.entityId,
        lookupValueId: command.lookupValueId,
      },
    });

    this.logger.log(
      `Filter ${command.lookupValueId} removed from ${command.entityType}/${command.entityId}`,
    );
  }
}
