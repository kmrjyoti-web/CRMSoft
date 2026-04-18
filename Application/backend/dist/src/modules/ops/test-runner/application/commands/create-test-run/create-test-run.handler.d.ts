import { ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { CreateTestRunCommand } from './create-test-run.command';
import { ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
export declare class CreateTestRunHandler implements ICommandHandler<CreateTestRunCommand> {
    private readonly repo;
    private readonly queue;
    private readonly logger;
    constructor(repo: ITestRunRepository, queue: Queue);
    execute(cmd: CreateTestRunCommand): Promise<{
        id: string;
        status: string;
    }>;
}
