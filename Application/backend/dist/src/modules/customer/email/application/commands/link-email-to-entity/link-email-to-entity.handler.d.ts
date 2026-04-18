import { ICommandHandler } from '@nestjs/cqrs';
import { LinkEmailToEntityCommand } from './link-email-to-entity.command';
import { EmailLinkerService } from '../../../services/email-linker.service';
export declare class LinkEmailToEntityHandler implements ICommandHandler<LinkEmailToEntityCommand> {
    private readonly emailLinker;
    private readonly logger;
    constructor(emailLinker: EmailLinkerService);
    execute(cmd: LinkEmailToEntityCommand): Promise<void>;
}
