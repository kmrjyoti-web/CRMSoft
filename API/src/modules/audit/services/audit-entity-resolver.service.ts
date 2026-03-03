import { Injectable } from '@nestjs/common';

export interface ResolvedEntity {
  entityType: string;
  entityId: string | null;
  action: string;
  module: string;
}

interface RouteMapping {
  pattern: RegExp;
  entityType: string;
  module: string;
}

@Injectable()
export class AuditEntityResolverService {
  private readonly ROUTE_MAP: RouteMapping[] = [
    { pattern: /^\/(?:api\/)?leads(?:\/([^\/\?]+))?/, entityType: 'LEAD', module: 'leads' },
    { pattern: /^\/(?:api\/)?contacts(?:\/([^\/\?]+))?/, entityType: 'CONTACT', module: 'contacts' },
    { pattern: /^\/(?:api\/)?organizations(?:\/([^\/\?]+))?/, entityType: 'ORGANIZATION', module: 'organizations' },
    { pattern: /^\/(?:api\/)?quotations(?:\/([^\/\?]+))?/, entityType: 'QUOTATION', module: 'quotations' },
    { pattern: /^\/(?:api\/)?activities(?:\/([^\/\?]+))?/, entityType: 'ACTIVITY', module: 'activities' },
    { pattern: /^\/(?:api\/)?demos(?:\/([^\/\?]+))?/, entityType: 'DEMO', module: 'demos' },
    { pattern: /^\/(?:api\/)?tour-plans(?:\/([^\/\?]+))?/, entityType: 'TOUR_PLAN', module: 'tour-plans' },
    { pattern: /^\/(?:api\/)?follow-ups(?:\/([^\/\?]+))?/, entityType: 'FOLLOW_UP', module: 'follow-ups' },
    { pattern: /^\/(?:api\/)?reminders(?:\/([^\/\?]+))?/, entityType: 'REMINDER', module: 'reminders' },
    { pattern: /^\/(?:api\/)?recurrence(?:\/([^\/\?]+))?/, entityType: 'RECURRENCE_RULE', module: 'recurrence' },
    { pattern: /^\/(?:api\/)?ownership(?:\/([^\/\?]+))?/, entityType: 'ENTITY_OWNER', module: 'ownership' },
    { pattern: /^\/(?:api\/)?users(?:\/([^\/\?]+))?/, entityType: 'USER', module: 'users' },
    { pattern: /^\/(?:api\/)?roles(?:\/([^\/\?]+))?/, entityType: 'ROLE', module: 'roles' },
    { pattern: /^\/(?:api\/)?lookup-values(?:\/([^\/\?]+))?/, entityType: 'LOOKUP_VALUE', module: 'lookups' },
    { pattern: /^\/(?:api\/)?notifications(?:\/([^\/\?]+))?/, entityType: 'NOTIFICATION', module: 'notifications' },
    { pattern: /^\/(?:api\/)?performance\/targets(?:\/([^\/\?]+))?/, entityType: 'SALES_TARGET', module: 'performance' },
    { pattern: /^\/(?:api\/)?assignment-rules(?:\/([^\/\?]+))?/, entityType: 'ASSIGNMENT_RULE', module: 'ownership' },
  ];

  private readonly STATUS_ACTION_KEYWORDS = [
    'accept', 'reject', 'complete', 'cancel', 'send', 'approve',
    'check-in', 'check-out', 'no-show', 'reschedule', 'submit',
    'revoke', 'snooze', 'dismiss', 'reassign',
  ];

  resolve(url: string, params: Record<string, string>, method: string): ResolvedEntity | null {
    const cleanUrl = url.split('?')[0];

    for (const route of this.ROUTE_MAP) {
      const match = cleanUrl.match(route.pattern);
      if (match) {
        const entityId = match[1] || params?.id || null;
        const action = this.determineAction(cleanUrl, method);
        return {
          entityType: route.entityType,
          entityId: entityId && entityId !== 'stats' && entityId !== 'search' && entityId !== 'export' ? entityId : null,
          action,
          module: route.module,
        };
      }
    }
    return null;
  }

  private determineAction(url: string, method: string): string {
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1]?.toLowerCase() || '';

    // Bulk operations
    if (lastSegment.startsWith('bulk-')) {
      return method === 'DELETE' ? 'BULK_DELETE' : 'BULK_UPDATE';
    }

    // Status change keywords
    if (method === 'POST' && this.STATUS_ACTION_KEYWORDS.some(kw => url.toLowerCase().includes(`/${kw}`))) {
      return 'STATUS_CHANGE';
    }

    // Standard method mapping
    switch (method) {
      case 'POST': return 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      default: return 'UPDATE';
    }
  }
}
