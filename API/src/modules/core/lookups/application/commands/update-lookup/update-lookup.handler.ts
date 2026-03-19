import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateLookupCommand } from './update-lookup.command';

@CommandHandler(UpdateLookupCommand)
export class UpdateLookupHandler implements ICommandHandler<UpdateLookupCommand> {
  private readonly logger = new Logger(UpdateLookupHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateLookupCommand): Promise<void> {
    const lookup = await this.prisma.masterLookup.findUnique({
      where: { id: command.lookupId },
    });
    if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);
    if (lookup.isSystem) throw new ForbiddenException('Cannot modify system lookup');

    const data: any = {};
    if (command.data.displayName) data.displayName = command.data.displayName.trim();
    if (command.data.description !== undefined) data.description = command.data.description?.trim() || null;

    await this.prisma.masterLookup.update({ where: { id: command.lookupId }, data });
    this.logger.log(`Lookup ${lookup.category} updated`);
  }
}
