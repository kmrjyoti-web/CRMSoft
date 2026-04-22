import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { DeactivateValueCommand } from './deactivate-value.command';

@CommandHandler(DeactivateValueCommand)
export class DeactivateValueHandler implements ICommandHandler<DeactivateValueCommand> {
  private readonly logger = new Logger(DeactivateValueHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(command: DeactivateValueCommand): Promise<void> {
    try {
      const val = await this.prisma!.platform.lookupValue.findUnique({ where: { id: command.valueId } });
      if (!val) throw new NotFoundException(`LookupValue ${command.valueId} not found`);

      await this.prisma!.platform.lookupValue.update({
        where: { id: command.valueId },
        data: { isActive: false },
      });
      this.logger.log(`LookupValue ${val.value} deactivated`);
    } catch (error) {
      this.logger.error(`DeactivateValueHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
