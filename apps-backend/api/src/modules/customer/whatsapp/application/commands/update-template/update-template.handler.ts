import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTemplateCommand } from './update-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTemplateCommand)
export class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
  private readonly logger = new Logger(UpdateTemplateHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTemplateCommand) {
    try {
      const updateData: Record<string, any> = {};

      if (command.name !== undefined) {
        updateData.name = command.name;
      }
      if (command.bodyText !== undefined) {
        updateData.bodyText = command.bodyText;
      }
      if (command.footerText !== undefined) {
        updateData.footerText = command.footerText;
      }
      if (command.buttons !== undefined) {
        updateData.buttons = command.buttons;
      }

      const template = await this.prisma.working.waTemplate.update({
        where: { id: command.templateId },
        data: updateData,
      });

      this.logger.log(`Template ${command.templateId} updated`);

      return template;
    } catch (error) {
      this.logger.error(`UpdateTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
