import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeactivateLookupCommand } from './deactivate-lookup.command';

@CommandHandler(DeactivateLookupCommand)
export class DeactivateLookupHandler implements ICommandHandler<DeactivateLookupCommand> {
  private readonly logger = new Logger(DeactivateLookupHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivateLookupCommand): Promise<void> {
    const lookup = await this.prisma.masterLookup.findUnique({
      where: { id: command.lookupId },
    });
    if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);
    if (lookup.isSystem) throw new ForbiddenException('Cannot deactivate system lookup');

    await this.prisma.masterLookup.update({
      where: { id: command.lookupId },
      data: { isActive: false },
    });
    this.logger.log(`Lookup ${lookup.category} deactivated`);
  }
}
