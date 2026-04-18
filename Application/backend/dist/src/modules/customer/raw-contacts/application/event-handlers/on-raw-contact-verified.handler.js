"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnRawContactVerifiedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnRawContactVerifiedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const raw_contact_verified_event_1 = require("../../domain/events/raw-contact-verified.event");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const ledger_service_1 = require("../../../../customer/accounts/services/ledger.service");
const rule_resolver_service_1 = require("../../../../softwarevendor/control-room/services/rule-resolver.service");
const cross_service_decorator_1 = require("../../../../../common/decorators/cross-service.decorator");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let OnRawContactVerifiedHandler = OnRawContactVerifiedHandler_1 = class OnRawContactVerifiedHandler {
    constructor(prisma, ledgerService, ruleResolver) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
        this.ruleResolver = ruleResolver;
        this.logger = new common_1.Logger(OnRawContactVerifiedHandler_1.name);
    }
    async handle(event) {
        this.logger.log(`RawContact ${event.rawContactId} → Contact ${event.contactId} ` +
            `(verified by ${event.verifiedById})`);
        try {
            await this.autoCreateLedger(event);
        }
        catch (err) {
            this.logger.error(`Failed to auto-create ledger for Contact ${event.contactId}: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
    async autoCreateLedger(event) {
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
        const rule = await this.ruleResolver.resolveRule(tenantId, 'MST_AUTO_CREATE_LEDGER');
        if (!rule || rule.value !== true) {
            this.logger.log(`MST_AUTO_CREATE_LEDGER is disabled for tenant ${tenantId} — skipping`);
            return;
        }
        const existingMapping = await this.prisma.working.ledgerMapping.findFirst({
            where: { tenantId, entityType: 'CONTACT', entityId: event.contactId },
        });
        if (existingMapping) {
            this.logger.log(`Ledger mapping already exists for Contact ${event.contactId} — skipping`);
            return;
        }
        const comms = await this.prisma.working.communication.findMany({
            where: { contactId: event.contactId },
            select: { type: true, value: true, isPrimary: true },
        });
        const email = comms.find((c) => c.type === 'EMAIL')?.value ?? undefined;
        const phone = comms.find((c) => c.type === 'MOBILE' || c.type === 'PHONE')?.value ?? undefined;
        const contactOrg = await this.prisma.working.contactOrganization.findFirst({
            where: { contactId: event.contactId },
            include: { organization: { select: { name: true, gstNumber: true, address: true, city: true, state: true, pincode: true, country: true } } },
        });
        const org = contactOrg?.organization;
        const contactName = `${contact.firstName} ${contact.lastName}`.trim();
        const sundryDebtorsGroup = await this.prisma.working.accountGroup.findFirst({
            where: { tenantId, primaryGroup: 'SUNDRY_DEBTORS' },
            select: { id: true },
        });
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
        await this.ledgerService.createLedgerMapping(tenantId, {
            entityType: 'CONTACT',
            entityId: event.contactId,
            entityName: contactName,
            ledgerId: ledger.id,
            mappingType: 'CUSTOMER',
            gstin: org?.gstNumber ?? undefined,
        });
        this.logger.log(`Auto-created ledger "${ledger.code} — ${contactName}" and mapping for Contact ${event.contactId}`);
    }
};
exports.OnRawContactVerifiedHandler = OnRawContactVerifiedHandler;
exports.OnRawContactVerifiedHandler = OnRawContactVerifiedHandler = OnRawContactVerifiedHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('vendor', 'Reads MST_AUTO_CREATE_LEDGER rule from vendor ControlRoom to decide whether to auto-create an accounting ledger on contact verification'),
    (0, cqrs_1.EventsHandler)(raw_contact_verified_event_1.RawContactVerifiedEvent),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.AccountLedgerService,
        rule_resolver_service_1.RuleResolverService])
], OnRawContactVerifiedHandler);
//# sourceMappingURL=on-raw-contact-verified.handler.js.map