import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteTemplateCommand } from './delete-template.command';
import { WaTemplateService } from '../../../services/wa-template.service';
export declare class DeleteTemplateHandler implements ICommandHandler<DeleteTemplateCommand> {
    private readonly waTemplateService;
    private readonly logger;
    constructor(waTemplateService: WaTemplateService);
    execute(command: DeleteTemplateCommand): Promise<void>;
}
