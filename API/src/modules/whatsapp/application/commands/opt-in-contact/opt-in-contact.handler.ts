import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OptInContactCommand } from './opt-in-contact.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(OptInContactCommand)
export class OptInContactHandler implements ICommandHandler<OptInContactCommand> {
  private readonly logger = new Logger(OptInContactHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: OptInContactCommand) {
    const result = await this.prisma.waOptOut.deleteMany({
      where: {
        wabaId: cmd.wabaId,
        phoneNumber: cmd.phoneNumber,
      },
    });

    this.logger.log(`Contact opted in: ${cmd.phoneNumber} for WABA ${cmd.wabaId} (${result.count} record(s) removed)`);
    return result;
  }
}
