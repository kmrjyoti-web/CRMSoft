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
import { ActivatePortalCommand } from './activate-portal.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';
import { CustomerUserEntity } from '../../../domain/entities/customer-user.entity';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { isErr, isOk } from '@/common/types';

@CommandHandler(ActivatePortalCommand)
export class ActivatePortalHandler implements ICommandHandler<ActivatePortalCommand> {
  private readonly logger = new Logger(ActivatePortalHandler.name);

  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: ActivatePortalCommand) {
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

    // 6. TODO: Send credentials via email + WhatsApp
    this.logger.log(
      `[CUSTOMER PORTAL] Activated for ${email} (${entityType}:${entityId}). Temp password: ${tempPassword}`,
    );

    return {
      customerUserId: customer.id,
      email: customer.email,
      tempPassword,
      message: `Portal access activated. Credentials sent to ${email}`,
    };
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
