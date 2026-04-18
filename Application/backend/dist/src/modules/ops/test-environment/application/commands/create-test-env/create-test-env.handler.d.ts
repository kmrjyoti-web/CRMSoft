import { ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { CreateTestEnvCommand } from './create-test-env.command';
import { ITestEnvRepository } from '../../../infrastructure/repositories/test-env.repository';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
export declare const TEST_ENV_QUEUE = "ops-test-environment";
export declare class CreateTestEnvHandler implements ICommandHandler<CreateTestEnvCommand> {
    private readonly repo;
    private readonly queue;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ITestEnvRepository, queue: Queue, prisma: PrismaService);
    execute(cmd: CreateTestEnvCommand): Promise<{
        id: string;
        name: string;
    }>;
    private resolveCompanyCode;
}
