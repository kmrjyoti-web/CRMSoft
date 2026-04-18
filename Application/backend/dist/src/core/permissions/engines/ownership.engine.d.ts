import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';
export declare class OwnershipEngine {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(ctx: PermissionContext): Promise<boolean>;
    isPrimaryOwner(userId: string, resourceType: string, entityId: string): Promise<boolean>;
    getOwners(resourceType: string, entityId: string): Promise<({
        user: never;
    } & {
        id: string;
        tenantId: string;
        entityType: import("@prisma/working-client").$Enums.EntityType;
        isActive: boolean;
        configJson: import("@prisma/working-client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string | null;
        priority: number;
        entityId: string;
        validFrom: Date;
        validTo: Date | null;
        ownerType: import("@prisma/working-client").$Enums.OwnerType;
        teamId: string | null;
        assignedById: string;
        assignmentReason: string | null;
    })[]>;
    private mapResourceToEntityType;
}
