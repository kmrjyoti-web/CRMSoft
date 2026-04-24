import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTemplateCommand } from './create-template.command';
import { NotificationTemplateService } from '../../../services/template.service';

@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
    private readonly logger = new Logger(CreateTemplateHandler.name);

  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(command: CreateTemplateCommand) {
    try {
      return this.templateService.create({
        name: command.name,
        category: command.category,
        subject: command.subject,
        body: command.body,
        channels: command.channels,
        variables: command.variables,
      });
    } catch (error) {
      this.logger.error(`CreateTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
