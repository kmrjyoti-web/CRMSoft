import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { DeactivateValueCommand } from './deactivate-value.command';

@CommandHandler(DeactivateValueCommand)
export class DeactivateValueHandler implements ICommandHandler<DeactivateValueCommand> {
  private readonly logger = new Logger(DeactivateValueHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivateValueCommand): Promise<void> {
    const val = await this.prisma.platform.lookupValue.findUnique({ where: { id: command.valueId } });
    if (!val) throw new NotFoundException(`LookupValue ${command.valueId} not found`);

    await this.prisma.platform.lookupValue.update({
      where: { id: command.valueId },
      data: { isActive: false },
    });
    this.logger.log(`LookupValue ${val.value} deactivated`);
  }
}
