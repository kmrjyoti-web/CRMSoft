import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class AuditSnapshotService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    captureSnapshot(entityType: string, entityId: string): Promise<Record<string, any> | null>;
    getEntityLabel(entityType: string, entityId: string, snapshot?: any): string;
    private serializeSnapshot;
}
