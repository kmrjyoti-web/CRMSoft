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
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?leads(?:\/([^\/\?]+))?/, entityType: 'LEAD', module: 'leads' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?contacts(?:\/([^\/\?]+))?/, entityType: 'CONTACT', module: 'contacts' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?organizations(?:\/([^\/\?]+))?/, entityType: 'ORGANIZATION', module: 'organizations' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?quotations(?:\/([^\/\?]+))?/, entityType: 'QUOTATION', module: 'quotations' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?activities(?:\/([^\/\?]+))?/, entityType: 'ACTIVITY', module: 'activities' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?demos(?:\/([^\/\?]+))?/, entityType: 'DEMO', module: 'demos' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?tour-plans(?:\/([^\/\?]+))?/, entityType: 'TOUR_PLAN', module: 'tour-plans' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?follow-ups(?:\/([^\/\?]+))?/, entityType: 'FOLLOW_UP', module: 'follow-ups' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?reminders(?:\/([^\/\?]+))?/, entityType: 'REMINDER', module: 'reminders' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?recurrence(?:\/([^\/\?]+))?/, entityType: 'RECURRENCE_RULE', module: 'recurrence' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?ownership(?:\/([^\/\?]+))?/, entityType: 'ENTITY_OWNER', module: 'ownership' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?users(?:\/([^\/\?]+))?/, entityType: 'USER', module: 'users' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?roles(?:\/([^\/\?]+))?/, entityType: 'ROLE', module: 'roles' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?lookup-values(?:\/([^\/\?]+))?/, entityType: 'LOOKUP_VALUE', module: 'lookups' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?notifications(?:\/([^\/\?]+))?/, entityType: 'NOTIFICATION', module: 'notifications' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?performance\/targets(?:\/([^\/\?]+))?/, entityType: 'SALES_TARGET', module: 'performance' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?assignment-rules(?:\/([^\/\?]+))?/, entityType: 'ASSIGNMENT_RULE', module: 'ownership' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?products(?:\/([^\/\?]+))?/, entityType: 'PRODUCT', module: 'products' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?pricing\/([^\/\?]+)/, entityType: 'PRODUCT', module: 'product-pricing' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?price-groups(?:\/([^\/\?]+))?/, entityType: 'PRODUCT', module: 'price-groups' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?tax(?:\/([^\/\?]+))?/, entityType: 'PRODUCT', module: 'product-tax' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?invoices(?:\/([^\/\?]+))?/, entityType: 'INVOICE', module: 'invoices' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?payments(?:\/([^\/\?]+))?/, entityType: 'PAYMENT', module: 'payments' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?workflows(?:\/([^\/\?]+))?/, entityType: 'WORKFLOW', module: 'workflows' },
    { pattern: /^\/(?:api\/(?:v\d+\/)?)?communications(?:\/([^\/\?]+))?/, entityType: 'COMMUNICATION', module: 'communications' },
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
        // If there are more path segments after the matched portion, this is a sub-resource action
        const hasSubRoute = cleanUrl.length > match[0].length && cleanUrl[match[0].length] === '/';
        const action = this.determineAction(cleanUrl, method, hasSubRoute && !!entityId);
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

  private determineAction(url: string, method: string, isSubResource = false): string {
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
      case 'POST': return isSubResource ? 'UPDATE' : 'CREATE';
      case 'PUT':
      case 'PATCH': return 'UPDATE';
      case 'DELETE': return 'DELETE';
      default: return 'UPDATE';
    }
  }
}
