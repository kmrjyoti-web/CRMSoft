import { ICommandHandler } from '@nestjs/cqrs';
import { LogManualTestCommand } from './log-manual-test.command';
import { IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';
export declare class LogManualTestHandler implements ICommandHandler<LogManualTestCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IManualTestLogRepository);
    execute(cmd: LogManualTestCommand): Promise<Record<string, unknown>>;
}
