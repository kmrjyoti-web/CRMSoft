import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateSignatureCommand } from './update-signature.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateSignatureCommand)
export class UpdateSignatureHandler implements ICommandHandler<UpdateSignatureCommand> {
  private readonly logger = new Logger(UpdateSignatureHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateSignatureCommand) {
    try {
      // If setting as default -> update all others for the same user
      if (cmd.isDefault) {
        const existing = await this.prisma.working.emailSignature.findUniqueOrThrow({
          where: { id: cmd.id },
        });
        await this.prisma.working.emailSignature.updateMany({
          where: { userId: existing.userId },
          data: { isDefault: false },
        });
      }

      const data: Record<string, any> = {};
      if (cmd.name !== undefined) data.name = cmd.name;
      if (cmd.bodyHtml !== undefined) data.bodyHtml = cmd.bodyHtml;
      if (cmd.isDefault !== undefined) data.isDefault = cmd.isDefault;

      const signature = await this.prisma.working.emailSignature.update({
        where: { id: cmd.id },
        data,
      });

      this.logger.log(`Email signature updated: ${cmd.id}`);
      return signature;
    } catch (error) {
      this.logger.error(`UpdateSignatureHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
