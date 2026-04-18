import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetInstanceHistoryQuery } from './get-instance-history.query';
export declare class GetInstanceHistoryHandler implements IQueryHandler<GetInstanceHistoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetInstanceHistoryQuery): Promise<({
        fromState: {
            id: string;
            name: string;
            code: string;
            color: string | null;
        } | null;
        toState: {
            id: string;
            name: string;
            code: string;
            color: string | null;
        };
        transition: {
            id: string;
            name: string;
            code: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        fromStateId: string | null;
        toStateId: string;
        action: string;
        duration: number | null;
        comment: string | null;
        instanceId: string;
        transitionId: string | null;
        performedById: string;
        performedByName: string;
    })[]>;
}
