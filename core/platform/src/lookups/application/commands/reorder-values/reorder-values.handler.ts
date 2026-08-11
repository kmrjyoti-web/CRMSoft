import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { ReorderValuesCommand } from './reorder-values.command';

@CommandHandler(ReorderValuesCommand)
export class ReorderValuesHandler implements ICommandHandler<ReorderValuesCommand> {
  private readonly logger = new Logger(ReorderValuesHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(command: ReorderValuesCommand): Promise<void> {
    try {
      const lookup = await this.prisma!.platform.masterLookup.findUnique({
        where: { id: command.lookupId },
      });
      if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);

      // Update rowIndex for each value in order
      const updates = command.orderedIds.map((id, index) =>
        this.prisma!.platform.lookupValue.update({
          where: { id },
          data: { rowIndex: index },
        }),
      );

      await this.prisma!.$transaction(updates);
      this.logger.log(`Values reordered for ${lookup.category}`);
    } catch (error) {
      this.logger.error(`ReorderValuesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
