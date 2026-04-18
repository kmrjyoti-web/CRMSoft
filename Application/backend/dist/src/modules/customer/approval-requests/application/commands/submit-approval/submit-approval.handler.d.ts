import { ICommandHandler } from '@nestjs/cqrs';
import { SubmitApprovalCommand } from './submit-approval.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
export declare class SubmitApprovalHandler implements ICommandHandler<SubmitApprovalCommand> {
    private readonly makerChecker;
    private readonly logger;
    constructor(makerChecker: MakerCheckerEngine);
    execute(cmd: SubmitApprovalCommand): Promise<{
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
    } | null>;
}
