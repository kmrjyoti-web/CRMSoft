import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateTestPlanCommand } from './update-test-plan.command';
import { ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';
export declare class UpdateTestPlanHandler implements ICommandHandler<UpdateTestPlanCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: ITestPlanRepository);
    execute(cmd: UpdateTestPlanCommand): Promise<Record<string, unknown>>;
}
