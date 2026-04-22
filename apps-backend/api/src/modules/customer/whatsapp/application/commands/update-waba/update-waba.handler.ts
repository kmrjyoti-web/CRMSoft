import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateWabaCommand } from './update-waba.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateWabaCommand)
export class UpdateWabaHandler implements ICommandHandler<UpdateWabaCommand> {
  private readonly logger = new Logger(UpdateWabaHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateWabaCommand) {
    try {
      const updateData: Record<string, any> = {};

      if (cmd.displayName !== undefined) updateData.displayName = cmd.displayName;
      if (cmd.accessToken !== undefined) updateData.accessToken = cmd.accessToken;
      if (cmd.settings !== undefined) updateData.settings = cmd.settings;

      const waba = await this.prisma.working.whatsAppBusinessAccount.update({
        where: { id: cmd.id },
        data: updateData,
      });

      this.logger.log(`WABA updated: ${waba.id}`);
      return waba;
    } catch (error) {
      this.logger.error(`UpdateWabaHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
