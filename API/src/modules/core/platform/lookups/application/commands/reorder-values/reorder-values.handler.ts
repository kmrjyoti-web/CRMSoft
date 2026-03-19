import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ReorderValuesCommand } from './reorder-values.command';

@CommandHandler(ReorderValuesCommand)
export class ReorderValuesHandler implements ICommandHandler<ReorderValuesCommand> {
  private readonly logger = new Logger(ReorderValuesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReorderValuesCommand): Promise<void> {
    const lookup = await this.prisma.platform.masterLookup.findUnique({
      where: { id: command.lookupId },
    });
    if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);

    // Update rowIndex for each value in order
    const updates = command.orderedIds.map((id, index) =>
      this.prisma.platform.lookupValue.update({
        where: { id },
        data: { rowIndex: index },
      }),
    );

    await this.prisma.$transaction(updates);
    this.logger.log(`Values reordered for ${lookup.category}`);
  }
}
