import { SetMetadata } from '@nestjs/common';

export const AUDIT_ENTITY_KEY = 'audit:entityType';

export function AuditEntity(entityType: string): ClassDecorator {
  return SetMetadata(AUDIT_ENTITY_KEY, entityType);
}
