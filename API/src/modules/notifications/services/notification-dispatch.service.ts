import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationConfigService } from './notification-config.service';
import { ChannelRouterService } from './channel-router.service';
import { QuietHourService } from './quiet-hour.service';

export interface DispatchEvent {
  tenantId: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  actorId: string;
  data: Record<string, any>;
}

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: NotificationConfigService,
    private readonly channelRouter: ChannelRouterService,
    private readonly quietHourService: QuietHourService,
  ) {}

  /**
   * Central dispatch method called by all modules when events happen.
   * Resolves config, recipients, quiet hours, and routes to channels.
   */
  async dispatch(event: DispatchEvent): Promise<{ dispatched: number; skipped: number }> {
    const { tenantId, eventType, entityType, entityId, actorId, data } = event;

    // Step A: Load NotificationConfig for eventType + tenantId
    const config = await this.configService.getConfigForEvent(eventType, tenantId);
    if (!config || !config.isEnabled) {
      this.logger.debug(`Dispatch skipped: config not found or disabled for ${eventType}`);
      return { dispatched: 0, skipped: 0 };
    }

    // Step B: Resolve recipients based on config flags
    const recipientIds = await this.resolveRecipients(config, entityType, entityId, tenantId);

    // Step C: Exclude the actor (don't notify yourself)
    const filteredRecipients = recipientIds.filter((id) => id !== actorId);

    if (filteredRecipients.length === 0) {
      this.logger.debug(`Dispatch skipped: no recipients after filtering actor for ${eventType}`);
      return { dispatched: 0, skipped: 0 };
    }

    // Determine template name from config or event type
    const templateName = config.template?.name || eventType.toLowerCase().replace(/_/g, '_');

    // Determine priority from data or default
    const priority = (data.priority as string) || 'MEDIUM';

    let dispatched = 0;
    let skipped = 0;

    // Step D: For each recipient, check quiet hours and send
    for (const recipientId of filteredRecipients) {
      try {
        // Check quiet hours
        const inQuietHours = await this.quietHourService.isInQuietHours(
          recipientId,
          tenantId,
          priority,
        );

        // Build channel overrides based on quiet hours
        let channelOverrides: string[] | undefined;
        if (inQuietHours && config.respectQuietHours) {
          // During quiet hours with respectQuietHours, only send IN_APP
          channelOverrides = ['IN_APP'];
          this.logger.debug(`Quiet hours active for user ${recipientId}, restricting to IN_APP`);
        }

        // Build variables as string record for template rendering
        const variables: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
          variables[key] = String(value ?? '');
        }

        await this.channelRouter.send({
          templateName,
          recipientId,
          senderId: actorId,
          variables,
          entityType,
          entityId,
          priority,
          channelOverrides,
          groupKey: `${eventType}:${entityType || ''}:${entityId || ''}`,
        });

        dispatched++;
      } catch (error) {
        this.logger.error(
          `Failed to dispatch notification to ${recipientId} for ${eventType}: ${error.message}`,
        );
        skipped++;
      }
    }

    this.logger.log(
      `Dispatch complete for ${eventType}: ${dispatched} sent, ${skipped} skipped`,
    );
    return { dispatched, skipped };
  }

  /**
   * Resolve recipient user IDs based on NotificationConfig flags.
   * Checks: notifyAssignee, notifyCreator, notifyManager, notifyWatchers,
   * notifyDepartment, customRecipientIds.
   */
  private async resolveRecipients(
    config: any,
    entityType?: string,
    entityId?: string,
    tenantId = '',
  ): Promise<string[]> {
    const recipientSet = new Set<string>();

    if (!entityType || !entityId) {
      // Without entity context, only custom recipients apply
      this.addCustomRecipients(config, recipientSet);
      return Array.from(recipientSet);
    }

    // Try to load the entity to resolve assignee, creator, etc.
    const entity = await this.loadEntity(entityType, entityId);

    if (entity) {
      // Notify assignee
      if (config.notifyAssignee && entity.assignedToId) {
        recipientSet.add(entity.assignedToId);
      }

      // Notify creator
      if (config.notifyCreator && entity.createdById) {
        recipientSet.add(entity.createdById);
      }

      // Notify manager (reporting-to of the assignee)
      if (config.notifyManager && entity.assignedToId) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: entity.assignedToId },
          select: { reportingToId: true },
        });
        if (assignee?.reportingToId) {
          recipientSet.add(assignee.reportingToId);
        }
      }

      // Notify watchers (from entity's watchers relation or watcherIds JSON)
      if (config.notifyWatchers) {
        await this.addWatchers(entityType, entityId, recipientSet);
      }

      // Notify department members
      if (config.notifyDepartment && entity.assignedToId) {
        await this.addDepartmentMembers(entity.assignedToId, tenantId, recipientSet);
      }
    }

    // Custom recipient IDs from config
    this.addCustomRecipients(config, recipientSet);

    return Array.from(recipientSet);
  }

  /** Add custom recipient IDs from config. */
  private addCustomRecipients(config: any, recipientSet: Set<string>) {
    if (config.customRecipientIds) {
      const customIds = config.customRecipientIds as string[];
      if (Array.isArray(customIds)) {
        for (const id of customIds) {
          recipientSet.add(id);
        }
      }
    }
  }

  /** Load an entity generically by type and ID. */
  private async loadEntity(entityType: string, entityId: string): Promise<any> {
    const normalizedType = entityType.toLowerCase();
    try {
      switch (normalizedType) {
        case 'task':
          return this.prisma.task.findUnique({
            where: { id: entityId },
            select: { assignedToId: true, createdById: true },
          });
        case 'lead': {
          const lead = await this.prisma.lead.findUnique({
            where: { id: entityId },
            select: { allocatedToId: true, createdById: true },
          });
          return lead ? { assignedToId: lead.allocatedToId, createdById: lead.createdById } : null;
        }
        case 'contact':
          return this.prisma.contact.findUnique({
            where: { id: entityId },
            select: { createdById: true },
          }).then((c) => c ? { assignedToId: null, createdById: c.createdById } : null);
        case 'organization':
          return this.prisma.organization.findUnique({
            where: { id: entityId },
            select: { createdById: true },
          }).then((o) => o ? { assignedToId: null, createdById: o.createdById } : null);
        case 'quotation':
          return this.prisma.quotation.findUnique({
            where: { id: entityId },
            select: { createdById: true },
          }).then((q) => q ? { assignedToId: null, createdById: q.createdById } : null);
        default:
          this.logger.warn(`Unknown entity type for dispatch: ${entityType}`);
          return null;
      }
    } catch {
      this.logger.warn(`Failed to load entity ${entityType}:${entityId}`);
      return null;
    }
  }

  /** Add watchers for an entity. */
  private async addWatchers(
    entityType: string,
    entityId: string,
    recipientSet: Set<string>,
  ): Promise<void> {
    try {
      if (entityType.toLowerCase() === 'task') {
        const watchers = await this.prisma.taskWatcher.findMany({
          where: { taskId: entityId },
          select: { userId: true },
        });
        for (const w of watchers) {
          recipientSet.add(w.userId);
        }
      }
    } catch {
      this.logger.debug(`Failed to load watchers for ${entityType}:${entityId}`);
    }
  }

  /** Add department members of the assignee. */
  private async addDepartmentMembers(
    assigneeId: string,
    tenantId: string,
    recipientSet: Set<string>,
  ): Promise<void> {
    try {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
        select: { departmentId: true },
      });
      if (assignee?.departmentId) {
        const deptMembers = await this.prisma.user.findMany({
          where: {
            departmentId: assignee.departmentId,
            isDeleted: false,
            ...(tenantId ? { tenantId } : {}),
          },
          select: { id: true },
          take: 50, // cap to avoid runaway notifications
        });
        for (const m of deptMembers) {
          recipientSet.add(m.id);
        }
      }
    } catch {
      this.logger.debug(`Failed to resolve department members for assignee ${assigneeId}`);
    }
  }
}
