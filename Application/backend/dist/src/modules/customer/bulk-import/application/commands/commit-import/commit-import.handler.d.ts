import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ImportExecutorService } from '../../../services/import-executor.service';
import { ResultReportService } from '../../../services/result-report.service';
import { CommitImportCommand } from './commit-import.command';
export declare class CommitImportHandler implements ICommandHandler<CommitImportCommand> {
    private readonly prisma;
    private readonly executor;
    private readonly reportService;
    constructor(prisma: PrismaService, executor: ImportExecutorService, reportService: ResultReportService);
    execute(cmd: CommitImportCommand): Promise<{
        created: number;
        updated: number;
        skipped: number;
        failed: number;
        total: number;
    }>;
}
