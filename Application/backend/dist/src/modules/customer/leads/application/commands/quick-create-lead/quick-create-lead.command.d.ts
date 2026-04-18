import { InlineContactDto, InlineOrganizationDto } from '../../../presentation/dto/quick-create-lead.dto';
export declare class QuickCreateLeadCommand {
    readonly createdById: string;
    readonly contactId?: string | undefined;
    readonly inlineContact?: InlineContactDto | undefined;
    readonly organizationId?: string | undefined;
    readonly inlineOrganization?: InlineOrganizationDto | undefined;
    readonly priority?: string | undefined;
    readonly expectedValue?: number | undefined;
    readonly expectedCloseDate?: Date | undefined;
    readonly notes?: string | undefined;
    readonly filterIds?: string[] | undefined;
    constructor(createdById: string, contactId?: string | undefined, inlineContact?: InlineContactDto | undefined, organizationId?: string | undefined, inlineOrganization?: InlineOrganizationDto | undefined, priority?: string | undefined, expectedValue?: number | undefined, expectedCloseDate?: Date | undefined, notes?: string | undefined, filterIds?: string[] | undefined);
}
