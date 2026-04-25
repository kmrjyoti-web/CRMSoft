import { SetMetadata } from '@nestjs/common';

export interface AuditMeta {
  entityType?: string;
  action?: string;
  module?: string;
  summary?: string;
}

export const AUDIT_META_KEY = 'audit:meta';

export function Auditable(meta: AuditMeta): MethodDecorator {
  return SetMetadata(AUDIT_META_KEY, meta);
}
