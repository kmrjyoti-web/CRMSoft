import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RetryCommunicationCommand } from './retry-communication.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { PluginHandlerRegistry } from '../../../../plugins/handlers/handler-registry';
import { AppError } from '../../../../../common/errors/app-error';

const CHANNEL_TO_PLUGIN: Record<string, string> = {
  EMAIL: 'gmail',
  WHATSAPP: 'whatsapp_cloud',
};

const CHANNEL_TO_HOOK: Record<string, string> = {
  EMAIL: 'portal.invite.email',
  WHATSAPP: 'portal.invite.whatsapp',
};

@CommandHandler(RetryCommunicationCommand)
export class RetryCommunicationHandler implements ICommandHandler<RetryCommunicationCommand> {
  private readonly logger = new Logger(RetryCommunicationHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pluginRegistry: PluginHandlerRegistry,
  ) {}

  async execute(command: RetryCommunicationCommand) {
    const { tenantId, adminId, communicationLogId } = command;

    const workingClient = await this.prisma.getWorkingClient(tenantId);

    const log = await (workingClient as any).communicationLog.findFirst({
      where: { id: communicationLogId, tenantId, isDeleted: false },
    });

    if (!log) {
      throw AppError.from('COMMUNICATION_LOG_NOT_FOUND');
    }

    if (log.status === 'SENT' || log.status === 'DELIVERED') {
      throw AppError.from('COMMUNICATION_LOG_CANNOT_RETRY_SENT');
    }

    const pluginCode = CHANNEL_TO_PLUGIN[log.channel];
    const hookPoint = CHANNEL_TO_HOOK[log.channel];
    if (!pluginCode || !hookPoint) {
      throw AppError.from('COMMUNICATION_LOG_CHANNEL_NOT_SUPPORTED');
    }

    try {
      const plugin = this.pluginRegistry.get(pluginCode);
      const pluginResult = plugin
        ? await plugin.handle(
            hookPoint,
            {
              tenantId,
              entityType: log.entityType ?? 'UNKNOWN',
              entityId: log.entityId ?? 'UNKNOWN',
              action: hookPoint,
              data: { to: log.recipientAddr, subject: log.subject, body: log.body },
              userId: adminId,
            },
            {},
          )
        : undefined;

      const updated = await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: {
          status: 'QUEUED_AWAITING_PLUGIN_IMPL',
          externalId: (pluginResult as any)?.messageId ?? (pluginResult as any)?.id ?? null,
          errorMessage: null,
          sentAt: new Date(),
          updatedById: adminId,
        },
      });

      this.logger.log(
        `Retry queued for CommunicationLog ${log.id} (${log.channel}) by admin ${adminId}`,
      );

      return {
        communicationLogId: log.id,
        channel: log.channel,
        status: updated.status,
        externalId: updated.externalId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errorMessage: message,
          updatedById: adminId,
        },
      });
      this.logger.error(`Retry failed for CommunicationLog ${log.id}: ${message}`);
      throw err;
    }
  }
}
