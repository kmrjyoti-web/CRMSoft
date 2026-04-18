import { ICommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bull';
import { PrismaService } from "../../../../../../core/prisma/prisma.service";
import { RerunFailedTestsCommand } from './rerun-failed-tests.command';
import { ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';
export declare class RerunFailedTestsHandler implements ICommandHandler<RerunFailedTestsCommand> {
    private readonly repo;
    private readonly queue;
    private readonly prisma;
    private readonly logger;
    constructor(repo: ITestRunRepository, queue: Queue, prisma: PrismaService);
    execute(cmd: RerunFailedTestsCommand): Promise<{
        id: string;
        status: string;
    }>;
}
