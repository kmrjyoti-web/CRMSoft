export interface AuditMeta {
    entityType?: string;
    action?: string;
    module?: string;
    summary?: string;
}
export declare const AUDIT_META_KEY = "audit:meta";
export declare function Auditable(meta: AuditMeta): MethodDecorator;
