import { InlineContactDto, InlineOrganizationDto } from '../../../presentation/dto/quick-create-lead.dto';

export class QuickCreateLeadCommand {
  constructor(
    public readonly createdById: string,
    public readonly contactId?: string,
    public readonly inlineContact?: InlineContactDto,
    public readonly organizationId?: string,
    public readonly inlineOrganization?: InlineOrganizationDto,
    public readonly priority?: string,
    public readonly expectedValue?: number,
    public readonly expectedCloseDate?: Date,
    public readonly notes?: string,
    public readonly filterIds?: string[],
  ) {}
}
