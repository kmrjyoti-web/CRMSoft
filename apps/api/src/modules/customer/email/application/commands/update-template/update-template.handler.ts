import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTemplateCommand } from './update-template.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTemplateCommand)
export class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
  private readonly logger = new Logger(UpdateTemplateHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTemplateCommand) {
    try {
      const data: Record<string, any> = {};
      if (cmd.name !== undefined) data.name = cmd.name;
      if (cmd.category !== undefined) data.category = cmd.category;
      if (cmd.subject !== undefined) data.subject = cmd.subject;
      if (cmd.bodyHtml !== undefined) data.bodyHtml = cmd.bodyHtml;
      if (cmd.bodyText !== undefined) data.bodyText = cmd.bodyText;
      if (cmd.variables !== undefined) data.variables = cmd.variables;
      if (cmd.description !== undefined) data.description = cmd.description;
      if (cmd.isShared !== undefined) data.isShared = cmd.isShared;

      const template = await this.prisma.working.emailTemplate.update({
        where: { id: cmd.id },
        data,
      });

      this.logger.log(`Email template updated: ${cmd.id}`);
      return template;
    } catch (error) {
      this.logger.error(`UpdateTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
