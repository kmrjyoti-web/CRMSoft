import { ICommandHandler } from '@nestjs/cqrs';
import { CancelTestRunCommand } from './cancel-test-run.command';
import { ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
export declare class CancelTestRunHandler implements ICommandHandler<CancelTestRunCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestRunRepository);
    execute(cmd: CancelTestRunCommand): Promise<{
        id: string;
        status: string;
    }>;
}
