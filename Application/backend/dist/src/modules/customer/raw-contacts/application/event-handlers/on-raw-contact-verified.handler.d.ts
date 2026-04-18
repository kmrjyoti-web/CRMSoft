import { IEventHandler } from '@nestjs/cqrs';
import { RawContactVerifiedEvent } from '../../domain/events/raw-contact-verified.event';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AccountLedgerService } from '../../../../customer/accounts/services/ledger.service';
import { RuleResolverService } from '../../../../softwarevendor/control-room/services/rule-resolver.service';
export declare class OnRawContactVerifiedHandler implements IEventHandler<RawContactVerifiedEvent> {
    private readonly prisma;
    private readonly ledgerService;
    private readonly ruleResolver;
    private readonly logger;
    constructor(prisma: PrismaService, ledgerService: AccountLedgerService, ruleResolver: RuleResolverService);
    handle(event: RawContactVerifiedEvent): Promise<void>;
    private autoCreateLedger;
}
