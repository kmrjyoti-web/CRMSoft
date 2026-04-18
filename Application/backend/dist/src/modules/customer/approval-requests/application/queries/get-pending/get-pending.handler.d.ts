import { IQueryHandler } from '@nestjs/cqrs';
import { GetPendingQuery } from './get-pending.query';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
export declare class GetPendingHandler implements IQueryHandler<GetPendingQuery> {
    private readonly makerChecker;
    private readonly logger;
    constructor(makerChecker: MakerCheckerEngine);
    execute(query: GetPendingQuery): Promise<({
        maker: never;
    } & {
        id: string;
        tenantId: string;
        entityType: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        action: string;
        checkerRole: string;
        entityId: string | null;
        expiresAt: Date;
        decidedAt: Date | null;
        payload: import("@prisma/working-client/runtime/library").JsonValue;
        makerNote: string | null;
        makerId: string;
        checkerId: string | null;
        checkerNote: string | null;
    })[]>;
}
