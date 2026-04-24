import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { DeleteTemplateCommand } from './delete-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteTemplateCommand)
export class DeleteTemplateHandler implements ICommandHandler<DeleteTemplateCommand> {
  private readonly logger = new Logger(DeleteTemplateHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteTemplateCommand) {
    try {
      const template = await this.prisma.working.emailTemplate.findUniqueOrThrow({
        where: { id: cmd.id },
      });

      if (template.isSystem) {
        throw new BadRequestException('System templates cannot be deleted');
      }

      await this.prisma.working.emailTemplate.delete({
        where: { id: cmd.id },
      });

      this.logger.log(`Email template deleted: ${cmd.id}`);
    } catch (error) {
      this.logger.error(`DeleteTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
