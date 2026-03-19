import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTemplateCommand } from './create-template.command';
import { NotificationTemplateService } from '../../../services/template.service';

@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
  constructor(private readonly templateService: NotificationTemplateService) {}

  async execute(command: CreateTemplateCommand) {
    return this.templateService.create({
      name: command.name,
      category: command.category,
      subject: command.subject,
      body: command.body,
      channels: command.channels,
      variables: command.variables,
    });
  }
}
