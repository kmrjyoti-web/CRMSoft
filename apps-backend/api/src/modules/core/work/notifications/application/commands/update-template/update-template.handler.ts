import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTemplateCommand } from './update-template.command';
import { NotificationTemplateService } from '../../../services/template.service';

@CommandHandler(UpdateTemplateCommand)
export class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
    private readonly logger = new Logger(UpdateTemplateHandler.name);

  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(command: UpdateTemplateCommand) {
    try {
      const data: any = {};
      if (command.subject !== undefined) data.subject = command.subject;
      if (command.body !== undefined) data.body = command.body;
      if (command.channels !== undefined) data.channels = command.channels;
      if (command.variables !== undefined) data.variables = command.variables;
      if (command.isActive !== undefined) data.isActive = command.isActive;

      return this.templateService.update(command.id, data);
    } catch (error) {
      this.logger.error(`UpdateTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
