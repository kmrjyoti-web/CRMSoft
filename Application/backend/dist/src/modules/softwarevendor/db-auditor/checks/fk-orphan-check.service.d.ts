import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuditFinding } from '../dto/audit-finding.dto';
export declare class FkOrphanCheckService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    run(targetDb?: string, deep?: boolean): Promise<AuditFinding[]>;
    private getClient;
}
