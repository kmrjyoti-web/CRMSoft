import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RawContactVerifiedEvent } from '../../domain/events/raw-contact-verified.event';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AccountLedgerService } from '../../../../customer/accounts/services/ledger.service';
import { RuleResolverService } from '../../../../softwarevendor/control-room/services/rule-resolver.service';
import { CrossService } from '../../../../../common/decorators/cross-service.decorator';
import { getErrorMessage } from '@/common/utils/error.utils';

/**
 * Reacts to RawContactVerifiedEvent.
 * The heavy lifting (create Contact, update Communications) is done
 * in VerifyRawContactHandler. This handler is for side effects:
 * - Auto-create Ledger (if MST_AUTO_CREATE_LEDGER is enabled)
 * - Notifications (future)
 * - Audit logging (future)
 */
@CrossService('vendor', 'Reads MST_AUTO_CREATE_LEDGER rule from vendor ControlRoom to decide whether to auto-create an accounting ledger on contact verification')
@EventsHandler(RawContactVerifiedEvent)
export class OnRawContactVerifiedHandler implements IEventHandler<RawContactVerifiedEvent> {
  private readonly logger = new Logger(OnRawContactVerifiedHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: AccountLedgerService,
    private readonly ruleResolver: RuleResolverService,
  ) {}

  async handle(event: RawContactVerifiedEvent): Promise<void> {
    this.logger.log(
      `RawContact ${event.rawContactId} → Contact ${event.contactId} ` +
        `(verified by ${event.verifiedById})`,
    );

    // Auto-create ledger if control room rule is enabled
    try {
      await this.autoCreateLedger(event);
    } catch (err) {
      this.logger.error(`Failed to auto-create ledger for Contact ${event.contactId}: ${getErrorMessage(err)}`);
    }
  }

  private async autoCreateLedger(event: RawContactVerifiedEvent): Promise<void> {
    // Look up the contact to get its tenantId
    const contact = await this.prisma.working.contact.findUnique({
      where: { id: event.contactId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        designation: true,
        department: true,
        notes: true,
        tenantId: true,
      },
    });

    if (!contact?.tenantId) {
      this.logger.warn(`Contact ${event.contactId} has no tenantId — skipping auto-ledger`);
      return;
    }

    const tenantId = contact.tenantId;

    // Check control room rule: MST_AUTO_CREATE_LEDGER
    const rule = await this.ruleResolver.resolveRule(tenantId, 'MST_AUTO_CREATE_LEDGER');
    if (!rule || rule.value !== true) {
      this.logger.log(`MST_AUTO_CREATE_LEDGER is disabled for tenant ${tenantId} — skipping`);
      return;
    }

    // Check if a ledger mapping already exists for this contact
    const existingMapping = await this.prisma.working.ledgerMapping.findFirst({
      where: { tenantId, entityType: 'CONTACT', entityId: event.contactId },
    });
    if (existingMapping) {
      this.logger.log(`Ledger mapping already exists for Contact ${event.contactId} — skipping`);
      return;
    }

    // Get contact communications for email/phone
    const comms = await this.prisma.working.communication.findMany({
      where: { contactId: event.contactId },
      select: { type: true, value: true, isPrimary: true },
    });
    const email = comms.find((c) => c.type === 'EMAIL')?.value ?? undefined;
    const phone = comms.find((c) => c.type === 'MOBILE' || c.type === 'PHONE')?.value ?? undefined;

    // Get organization details if linked
    const contactOrg = await this.prisma.working.contactOrganization.findFirst({
      where: { contactId: event.contactId },
      include: { organization: { select: { name: true, gstNumber: true, address: true, city: true, state: true, pincode: true, country: true } } },
    });
    const org = contactOrg?.organization;

    const contactName = `${contact.firstName} ${contact.lastName}`.trim();

    // Find the "Sundry Debtors" account group for this tenant (standard for customer contacts)
    const sundryDebtorsGroup = await this.prisma.working.accountGroup.findFirst({
      where: { tenantId, primaryGroup: 'SUNDRY_DEBTORS' },
      select: { id: true },
    });

    // Create the ledger
    const ledger = await this.ledgerService.createLedger(tenantId, {
      name: contactName,
      groupType: 'ASSET',
      accountGroupId: sundryDebtorsGroup?.id,
      email,
      mobile1: phone,
      address: org?.address ?? undefined,
      city: org?.city ?? undefined,
      state: org?.state ?? undefined,
      pincode: org?.pincode ?? undefined,
      country: org?.country ?? 'India',
      gstin: org?.gstNumber ?? undefined,
      gstApplicable: !!org?.gstNumber,
    });

    // Create ledger mapping
    await this.ledgerService.createLedgerMapping(tenantId, {
      entityType: 'CONTACT',
      entityId: event.contactId,
      entityName: contactName,
      ledgerId: ledger.id,
      mappingType: 'CUSTOMER',
      gstin: org?.gstNumber ?? undefined,
    });

    this.logger.log(
      `Auto-created ledger "${ledger.code} — ${contactName}" and mapping for Contact ${event.contactId}`,
    );
  }
}
