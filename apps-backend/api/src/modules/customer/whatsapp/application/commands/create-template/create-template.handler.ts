import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTemplateCommand } from './create-template.command';
import { WaTemplateService } from '../../../services/wa-template.service';

@CommandHandler(CreateTemplateCommand)
export class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
  private readonly logger = new Logger(CreateTemplateHandler.name);

  constructor(private readonly waTemplateService: WaTemplateService) {}

  async execute(command: CreateTemplateCommand) {
    try {
      const template = await this.waTemplateService.createOnMeta(command.wabaId, {
        name: command.name,
        language: command.language,
        category: command.category,
        headerType: command.headerType,
        headerContent: command.headerContent,
        bodyText: command.bodyText,
        footerText: command.footerText,
        buttons: command.buttons,
        variables: command.variables,
        sampleValues: command.sampleValues,
      });

      this.logger.log(`Template "${command.name}" created for WABA ${command.wabaId}`);

      return template;
    } catch (error) {
      this.logger.error(`CreateTemplateHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
