import { ICommandHandler } from '@nestjs/cqrs';
import { ApproveRequestCommand } from './approve-request.command';
import { MakerCheckerEngine } from '../../../../../../core/permissions/engines/maker-checker.engine';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class ApproveRequestHandler implements ICommandHandler<ApproveRequestCommand> {
    private readonly makerChecker;
    private readonly prisma;
    private readonly logger;
    constructor(makerChecker: MakerCheckerEngine, prisma: PrismaService);
    execute(cmd: ApproveRequestCommand): Promise<{
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
    }>;
}
