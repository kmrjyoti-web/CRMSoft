import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SyncTemplatesCommand } from './sync-templates.command';
import { WaTemplateService } from '../../../services/wa-template.service';

@CommandHandler(SyncTemplatesCommand)
export class SyncTemplatesHandler implements ICommandHandler<SyncTemplatesCommand> {
  private readonly logger = new Logger(SyncTemplatesHandler.name);

  constructor(private readonly waTemplateService: WaTemplateService) {}

  async execute(command: SyncTemplatesCommand) {
    const result = await this.waTemplateService.syncFromMeta(command.wabaId);

    this.logger.log(
      `Templates synced for WABA ${command.wabaId}: ${result.synced} total, ${result.added} added, ${result.updated} updated`,
    );

    return result;
  }
}
