import { DbAuditorService } from './db-auditor.service';
import { AuditCheckId } from './dto/audit-finding.dto';
export declare class DbAuditorController {
    private readonly service;
    constructor(service: DbAuditorService);
    run(db?: string, deep?: string): Promise<import("./dto/audit-finding.dto").AuditReport>;
    runCheck(checkId: AuditCheckId, db?: string, deep?: string): Promise<import("./dto/audit-finding.dto").AuditReport>;
    getFindings(): import("./dto/audit-finding.dto").AuditReport | {
        message: string;
    };
}
