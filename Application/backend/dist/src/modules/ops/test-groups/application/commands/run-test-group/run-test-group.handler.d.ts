import { ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { RunTestGroupCommand } from './run-test-group.command';
import { ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';
export declare class RunTestGroupHandler implements ICommandHandler<RunTestGroupCommand> {
    private readonly repo;
    private readonly queue;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ITestGroupRepository, queue: Queue, prisma: PrismaService);
    execute(cmd: RunTestGroupCommand): Promise<{
        executionId: string;
        status: string;
    }>;
}
