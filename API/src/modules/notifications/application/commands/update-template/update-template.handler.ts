import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTemplateCommand } from './update-template.command';
import { NotificationTemplateService } from '../../../services/template.service';

@CommandHandler(UpdateTemplateCommand)
export class UpdateTemplateHandler implements ICommandHandler<UpdateTemplateCommand> {
  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(command: UpdateTemplateCommand) {
    const data: any = {};
    if (command.subject !== undefined) data.subject = command.subject;
    if (command.body !== undefined) data.body = command.body;
    if (command.channels !== undefined) data.channels = command.channels;
    if (command.variables !== undefined) data.variables = command.variables;
    if (command.isActive !== undefined) data.isActive = command.isActive;

    return this.templateService.update(command.id, data);
  }
}
