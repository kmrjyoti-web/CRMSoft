import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException, Logger, Optional, Inject } from '@nestjs/common';
import { PLATFORM_PRISMA, IPlatformPrisma } from '../../../../shared/prisma.token';
import { DeactivateLookupCommand } from './deactivate-lookup.command';

@CommandHandler(DeactivateLookupCommand)
export class DeactivateLookupHandler implements ICommandHandler<DeactivateLookupCommand> {
  private readonly logger = new Logger(DeactivateLookupHandler.name);

  constructor(
    @Optional() @Inject(PLATFORM_PRISMA) private readonly prisma?: IPlatformPrisma,
  ) {}

  async execute(command: DeactivateLookupCommand): Promise<void> {
    try {
      const lookup = await this.prisma!.platform.masterLookup.findUnique({
        where: { id: command.lookupId },
      });
      if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);
      if (lookup.isSystem) throw new ForbiddenException('Cannot deactivate system lookup');

      await this.prisma!.platform.masterLookup.update({
        where: { id: command.lookupId },
        data: { isActive: false },
      });
      this.logger.log(`Lookup ${lookup.category} deactivated`);
    } catch (error) {
      this.logger.error(`DeactivateLookupHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
