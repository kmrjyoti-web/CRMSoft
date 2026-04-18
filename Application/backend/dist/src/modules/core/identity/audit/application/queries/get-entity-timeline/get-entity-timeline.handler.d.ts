import { IQueryHandler } from '@nestjs/cqrs';
import { GetEntityTimelineQuery } from './get-entity-timeline.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { AuditSnapshotService } from '../../../services/audit-snapshot.service';
export declare class GetEntityTimelineHandler implements IQueryHandler<GetEntityTimelineQuery> {
    private readonly prisma;
    private readonly snapshotService;
    private readonly logger;
    constructor(prisma: PrismaService, snapshotService: AuditSnapshotService);
    execute(query: GetEntityTimelineQuery): Promise<{
        entity: {
            type: string;
            id: string;
            label: string;
            currentState: Record<string, any> | null;
        };
        timeline: {
            id: string;
            action: import("@prisma/identity-client").$Enums.AuditAction;
            summary: string;
            performedByName: string | null;
            performedById: string | null;
            createdAt: string;
            relativeTime: string;
            changeCount: number;
            fieldChanges: {
                fieldName: string;
                fieldLabel: string | null;
                oldValue: string | null;
                newValue: string | null;
                oldDisplayValue: string | null;
                newDisplayValue: string | null;
                fieldType: string | null;
            }[];
            icon: string;
            color: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    private getRelativeTime;
}
