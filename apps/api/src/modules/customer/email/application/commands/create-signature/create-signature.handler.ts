import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateSignatureCommand } from './create-signature.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateSignatureCommand)
export class CreateSignatureHandler implements ICommandHandler<CreateSignatureCommand> {
  private readonly logger = new Logger(CreateSignatureHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateSignatureCommand) {
    try {
      // If isDefault -> set all other signatures for this user to non-default
      if (cmd.isDefault) {
        await this.prisma.working.emailSignature.updateMany({
          where: { userId: cmd.userId },
          data: { isDefault: false },
        });
      }

      const signature = await this.prisma.working.emailSignature.create({
        data: {
          name: cmd.name,
          bodyHtml: cmd.bodyHtml,
          isDefault: cmd.isDefault,
          userId: cmd.userId,
        },
      });

      this.logger.log(`Email signature created: ${signature.id} (${cmd.name})`);
      return signature;
    } catch (error) {
      this.logger.error(`CreateSignatureHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
