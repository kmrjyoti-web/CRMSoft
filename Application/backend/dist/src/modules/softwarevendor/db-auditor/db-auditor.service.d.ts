import { NamingCheckService } from './checks/naming-check.service';
import { CrossDbIncludeCheckService } from './checks/cross-db-include-check.service';
import { FkOrphanCheckService } from './checks/fk-orphan-check.service';
import { AuditReport, AuditCheckId } from './dto/audit-finding.dto';
export declare class DbAuditorService {
    private readonly namingCheck;
    private readonly crossDbCheck;
    private readonly fkOrphanCheck;
    private readonly logger;
    private lastReport;
    constructor(namingCheck: NamingCheckService, crossDbCheck: CrossDbIncludeCheckService, fkOrphanCheck: FkOrphanCheckService);
    runAll(options?: {
        db?: string;
        deep?: boolean;
        skip?: AuditCheckId[];
    }): Promise<AuditReport>;
    runCheck(checkId: AuditCheckId, options?: {
        db?: string;
        deep?: boolean;
    }): Promise<AuditReport>;
    private run;
    getLastReport(): AuditReport | null;
    private buildSummary;
    private persistReport;
}
