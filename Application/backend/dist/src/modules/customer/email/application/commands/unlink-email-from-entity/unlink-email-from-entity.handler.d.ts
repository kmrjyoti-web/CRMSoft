import { ICommandHandler } from '@nestjs/cqrs';
import { UnlinkEmailFromEntityCommand } from './unlink-email-from-entity.command';
import { EmailLinkerService } from '../../../services/email-linker.service';
export declare class UnlinkEmailFromEntityHandler implements ICommandHandler<UnlinkEmailFromEntityCommand> {
    private readonly emailLinker;
    private readonly logger;
    constructor(emailLinker: EmailLinkerService);
    execute(cmd: UnlinkEmailFromEntityCommand): Promise<void>;
}
