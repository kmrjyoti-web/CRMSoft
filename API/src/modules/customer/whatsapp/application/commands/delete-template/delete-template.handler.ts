import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeleteTemplateCommand } from './delete-template.command';
import { WaTemplateService } from '../../../services/wa-template.service';

@CommandHandler(DeleteTemplateCommand)
export class DeleteTemplateHandler implements ICommandHandler<DeleteTemplateCommand> {
  private readonly logger = new Logger(DeleteTemplateHandler.name);

  constructor(private readonly waTemplateService: WaTemplateService) {}

  async execute(command: DeleteTemplateCommand): Promise<void> {
    await this.waTemplateService.deleteOnMeta(command.templateId);

    this.logger.log(`Template ${command.templateId} deleted`);
  }
}
