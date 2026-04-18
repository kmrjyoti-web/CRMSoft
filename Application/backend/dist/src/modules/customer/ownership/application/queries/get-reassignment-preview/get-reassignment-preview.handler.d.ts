import { IQueryHandler } from '@nestjs/cqrs';
import { GetReassignmentPreviewQuery } from './get-reassignment-preview.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { WorkloadService } from '../../../services/workload.service';
export declare class GetReassignmentPreviewHandler implements IQueryHandler<GetReassignmentPreviewQuery> {
    private readonly prisma;
    private readonly workload;
    private readonly logger;
    constructor(prisma: PrismaService, workload: WorkloadService);
    execute(query: GetReassignmentPreviewQuery): Promise<{
        fromUser: {
            name: string;
            currentLoad: number;
        };
        toUser: any;
        entitiesToTransfer: number;
        byType: Record<string, number>;
        warnings: string[];
    }>;
}
