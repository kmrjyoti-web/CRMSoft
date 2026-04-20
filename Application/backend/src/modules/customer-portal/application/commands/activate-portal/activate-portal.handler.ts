import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';
import { ActivatePortalCommand, InviteChannel } from './activate-portal.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { CustomerUserEntity } from '../../../domain/entities/customer-user.entity';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { PluginHandlerRegistry } from '../../../../plugins/handlers/handler-registry';
import { isErr, isOk } from '@/common/types';

type DeliveryResult = {
  channel: InviteChannel;
  status: 'QUEUED_AWAITING_PLUGIN_IMPL' | 'FAILED' | 'SKIPPED';
  logId?: string;
  error?: string;
};

@CommandHandler(ActivatePortalCommand)
export class ActivatePortalHandler implements ICommandHandler<ActivatePortalCommand> {
  private readonly logger = new Logger(ActivatePortalHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly prisma: PrismaService,
    private readonly pluginRegistry: PluginHandlerRegistry,
  ) {}

  async execute(command: ActivatePortalCommand) {
    try {
      const { tenantId, adminId, entityType, entityId, menuCategoryId } = command;

      // 1. Check not already activated
      const existing = await this.userRepo.findByLinkedEntity(tenantId, entityType, entityId);
      if (existing && !existing.isDeleted) {
        throw new ConflictException('Portal login already activated for this entity');
      }

      // 2. Fetch entity from WorkingDB + verify VERIFIED status
      const workingClient = await this.prisma.getWorkingClient(tenantId);
      const { name, email, phone } = await this.resolveEntity(
        workingClient,
        tenantId,
        entityType,
        entityId,
      );

      if (!email) {
        throw new BadRequestException(
          `This ${entityType.toLowerCase()} has no email address. Add an email before activating portal access.`,
        );
      }

      // 3. Resolve menu category (use provided or find default)
      let resolvedCategoryId = menuCategoryId;
      if (!resolvedCategoryId) {
        const defaultCat = await this.prisma.identity.customerMenuCategory.findFirst({
          where: { tenantId, isDefault: true, isActive: true, isDeleted: false },
        });
        resolvedCategoryId = defaultCat?.id;
      }

      // 4. Generate temporary password
      const tempPassword = this.generateTempPassword();

      // 5. Create CustomerUser entity
      const result = await CustomerUserEntity.create(uuid(), tenantId, {
        email,
        phone: phone ?? undefined,
        linkedEntityType: entityType as 'CONTACT' | 'ORGANIZATION' | 'LEDGER',
        linkedEntityId: entityId,
        linkedEntityName: name,
        displayName: name,
        menuCategoryId: resolvedCategoryId,
        isActive: true,
        password: tempPassword,
        createdById: adminId,
      });

      if (isErr(result)) throw new BadRequestException(result.error.message);
      if (!isOk(result)) throw new BadRequestException('Failed to create customer user');

      const saveResult = await this.userRepo.save(result.data);
      if (isErr(saveResult)) throw new BadRequestException(saveResult.error.message);
      if (!isOk(saveResult)) throw new BadRequestException('Failed to save customer user');

      const customer = saveResult.data;

      this.logger.log(
        `[CUSTOMER PORTAL] Activated for ${email} (${entityType}:${entityId}).`,
      );

      // 6. Deliver credentials on requested channels (plugins are stubs — status=QUEUED)
      const deliveries: DeliveryResult[] = [];
      if (command.channels && command.channels.length > 0) {
        const workingClient = await this.prisma.getWorkingClient(tenantId);
        const inviteUrl = `${process.env.CUSTOMER_PORTAL_URL || 'https://portal.crmsoft.com'}/login?email=${encodeURIComponent(email)}`;

        for (const channel of command.channels) {
          try {
            if (channel === 'EMAIL') {
              if (!email) {
                deliveries.push({ channel, status: 'SKIPPED', error: 'No email on record' });
                continue;
              }
              deliveries.push(
                await this.deliverEmail(
                  workingClient,
                  tenantId,
                  entityType,
                  entityId,
                  name,
                  email,
                  tempPassword,
                  inviteUrl,
                  command.customMessage,
                ),
              );
            } else if (channel === 'WHATSAPP') {
              const phoneToUse = await this.resolvePhoneForWhatsApp(
                workingClient,
                tenantId,
                entityType,
                entityId,
                phone,
              );
              if (!phoneToUse) {
                deliveries.push({ channel, status: 'SKIPPED', error: 'No phone on record' });
                continue;
              }
              deliveries.push(
                await this.deliverWhatsApp(
                  workingClient,
                  tenantId,
                  entityType,
                  entityId,
                  name,
                  phoneToUse,
                  email,
                  tempPassword,
                  inviteUrl,
                  command.customMessage,
                ),
              );
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            deliveries.push({ channel, status: 'FAILED', error: message });
          }
        }

        this.logger.log(
          `Portal activation deliveries for ${entityType}:${entityId} → ${JSON.stringify(deliveries)}`,
        );
      }

      return {
        customerUserId: customer.id,
        email: customer.email,
        tempPassword,
        message: 'Portal access activated',
        deliveries,
      };
    } catch (error) {
      this.logger.error(`ActivatePortalHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * For CONTACT: query Communication model for primary phone/mobile.
   * For ORGANIZATION: use phone field directly (already loaded).
   */
  private async resolvePhoneForWhatsApp(
    workingClient: Awaited<ReturnType<typeof this.prisma.getWorkingClient>>,
    tenantId: string,
    entityType: string,
    entityId: string,
    fallbackPhone: string | null,
  ): Promise<string | null> {
    if (entityType === 'ORGANIZATION' && fallbackPhone) return fallbackPhone;

    if (entityType === 'CONTACT') {
      const comm = await (workingClient as any).communication.findFirst({
        where: {
          tenantId,
          contactId: entityId,
          type: { in: ['PHONE', 'MOBILE'] },
          isPrimary: true,
          isDeleted: false,
        },
      });
      return comm?.value ?? null;
    }

    return fallbackPhone ?? null;
  }

  private async deliverEmail(
    workingClient: Awaited<ReturnType<typeof this.prisma.getWorkingClient>>,
    tenantId: string,
    entityType: string,
    entityId: string,
    recipientName: string,
    recipientEmail: string,
    tempPassword: string,
    inviteUrl: string,
    customMessage?: string,
  ): Promise<DeliveryResult> {
    const subject = 'Welcome to the Customer Portal';
    const body = [
      `Hi ${recipientName},`,
      '',
      customMessage || 'You have been invited to access the customer portal.',
      '',
      'Login credentials:',
      `Email: ${recipientEmail}`,
      `Temporary Password: ${tempPassword}`,
      '',
      `Login: ${inviteUrl}`,
      '',
      'Please change your password on first login.',
    ].join('\n');

    const log = await (workingClient as any).communicationLog.create({
      data: {
        tenantId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        recipientAddr: recipientEmail,
        subject,
        body,
        entityType,
        entityId,
        status: 'PENDING',
      },
    });

    try {
      const plugin = this.pluginRegistry.get('gmail');
      const pluginResult = plugin
        ? await plugin.handle(
            'portal.invite.email',
            {
              tenantId,
              entityType,
              entityId,
              action: 'portal.invite.email',
              data: { to: recipientEmail, subject, body },
            },
            {},
          )
        : undefined;

      await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: {
          status: 'QUEUED_AWAITING_PLUGIN_IMPL',
          externalId: (pluginResult as any)?.messageId ?? (pluginResult as any)?.id ?? null,
        },
      });

      return { channel: 'EMAIL', status: 'QUEUED_AWAITING_PLUGIN_IMPL', logId: log.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: message },
      });
      return { channel: 'EMAIL', status: 'FAILED', logId: log.id, error: message };
    }
  }

  private async deliverWhatsApp(
    workingClient: Awaited<ReturnType<typeof this.prisma.getWorkingClient>>,
    tenantId: string,
    entityType: string,
    entityId: string,
    recipientName: string,
    recipientPhone: string,
    recipientEmail: string | null,
    tempPassword: string,
    inviteUrl: string,
    customMessage?: string,
  ): Promise<DeliveryResult> {
    const body = `Hi ${recipientName}! ${customMessage || 'Your portal access is ready.'} Email: ${recipientEmail || 'N/A'} | Temp Password: ${tempPassword} | Login: ${inviteUrl}`;

    const log = await (workingClient as any).communicationLog.create({
      data: {
        tenantId,
        channel: 'WHATSAPP',
        direction: 'OUTBOUND',
        recipientAddr: recipientPhone,
        body,
        entityType,
        entityId,
        status: 'PENDING',
      },
    });

    try {
      const plugin = this.pluginRegistry.get('whatsapp_cloud');
      const pluginResult = plugin
        ? await plugin.handle(
            'portal.invite.whatsapp',
            {
              tenantId,
              entityType,
              entityId,
              action: 'portal.invite.whatsapp',
              data: { to: recipientPhone, body },
            },
            {},
          )
        : undefined;

      await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: {
          status: 'QUEUED_AWAITING_PLUGIN_IMPL',
          externalId: (pluginResult as any)?.messageId ?? (pluginResult as any)?.id ?? null,
        },
      });

      return { channel: 'WHATSAPP', status: 'QUEUED_AWAITING_PLUGIN_IMPL', logId: log.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await (workingClient as any).communicationLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: message },
      });
      return { channel: 'WHATSAPP', status: 'FAILED', logId: log.id, error: message };
    }
  }

  private async resolveEntity(
    workingClient: Awaited<ReturnType<typeof this.prisma.getWorkingClient>>,
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<{ name: string; email: string | null; phone: string | null }> {
    switch (entityType) {
      case 'CONTACT': {
        const contact = await (workingClient as any).contact.findFirst({
          where: { id: entityId, tenantId, isDeleted: false },
          include: {
            communications: {
              where: { type: 'EMAIL' },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        });
        if (!contact) throw new NotFoundException('Contact not found');
        if ((contact.entityVerificationStatus as string) !== 'VERIFIED') {
          throw new BadRequestException('Contact must be verified before activating portal access');
        }
        return {
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          email: contact.communications?.[0]?.value ?? null,
          phone: null,
        };
      }
      case 'ORGANIZATION': {
        const org = await (workingClient as any).organization.findFirst({
          where: { id: entityId, tenantId, isDeleted: false },
        });
        if (!org) throw new NotFoundException('Organization not found');
        if ((org.entityVerificationStatus as string) !== 'VERIFIED') {
          throw new BadRequestException('Organization must be verified before activating portal access');
        }
        return { name: org.name, email: org.email ?? null, phone: org.phone ?? null };
      }
      case 'LEDGER': {
        const ledger = await (workingClient as any).ledgerMaster.findFirst({
          where: { id: entityId, tenantId },
        });
        if (!ledger) throw new NotFoundException('Ledger entry not found');
        return { name: ledger.name, email: (ledger as any).email ?? null, phone: null };
      }
      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$';
    return Array.from(crypto.randomBytes(10))
      .map((b) => chars[b % chars.length])
      .join('');
  }
}
