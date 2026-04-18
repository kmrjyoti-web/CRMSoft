import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateManualTestLogCommand } from './update-manual-test-log.command';
import { IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';
export declare class UpdateManualTestLogHandler implements ICommandHandler<UpdateManualTestLogCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IManualTestLogRepository);
    execute(cmd: UpdateManualTestLogCommand): Promise<Record<string, unknown>>;
}
