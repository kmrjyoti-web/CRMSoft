import { ICommandHandler } from '@nestjs/cqrs';
import { CreateTestPlanCommand } from './create-test-plan.command';
import { ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';
export declare class CreateTestPlanHandler implements ICommandHandler<CreateTestPlanCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestPlanRepository);
    execute(cmd: CreateTestPlanCommand): Promise<Record<string, unknown>>;
}
