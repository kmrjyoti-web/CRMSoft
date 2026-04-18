import { ICommandHandler } from '@nestjs/cqrs';
import { SyncTemplatesCommand } from './sync-templates.command';
import { WaTemplateService } from '../../../services/wa-template.service';
export declare class SyncTemplatesHandler implements ICommandHandler<SyncTemplatesCommand> {
    private readonly waTemplateService;
    private readonly logger;
    constructor(waTemplateService: WaTemplateService);
    execute(command: SyncTemplatesCommand): Promise<{
        synced: number;
        added: number;
        updated: number;
    }>;
}
