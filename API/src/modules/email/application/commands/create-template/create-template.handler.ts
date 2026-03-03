import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTemplateCommand } from './create-template.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
  private readonly logger = new Logger(CreateTemplateHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateTemplateCommand) {
    const template = await this.prisma.emailTemplate.create({
      data: {
        name: cmd.name,
        category: cmd.category as any,
        subject: cmd.subject,
        bodyHtml: cmd.bodyHtml,
        bodyText: cmd.bodyText,
        variables: cmd.variables || [],
        description: cmd.description,
        isShared: cmd.isShared,
        createdById: cmd.userId,
        createdByName: cmd.userName,
      },
    });

    this.logger.log(`Email template created: ${template.id} (${cmd.name})`);
    return template;
  }
}
