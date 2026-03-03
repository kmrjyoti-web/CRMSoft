import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeleteSignatureCommand } from './delete-signature.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteSignatureCommand)
export class DeleteSignatureHandler implements ICommandHandler<DeleteSignatureCommand> {
  private readonly logger = new Logger(DeleteSignatureHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteSignatureCommand) {
    await this.prisma.emailSignature.delete({
      where: { id: cmd.id },
    });

    this.logger.log(`Email signature deleted: ${cmd.id}`);
  }
}
