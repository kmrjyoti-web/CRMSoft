import { AuditFinding } from '../dto/audit-finding.dto';
export declare class CrossDbIncludeCheckService {
    private readonly logger;
    run(): Promise<AuditFinding[]>;
    private buildModelDbMap;
    private findTsFiles;
}
