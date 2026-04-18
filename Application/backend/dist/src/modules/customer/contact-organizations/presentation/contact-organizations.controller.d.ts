import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LinkContactToOrgDto } from './dto/link-contact-to-org.dto';
import { ChangeRelationTypeDto } from './dto/change-relation-type.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class ContactOrganizationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    link(dto: LinkContactToOrgDto): Promise<ApiResponse<any>>;
    findById(id: string): Promise<ApiResponse<any>>;
    findByContact(contactId: string, activeOnly?: string): Promise<ApiResponse<any>>;
    findByOrg(orgId: string, activeOnly?: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateMappingDto): Promise<ApiResponse<any>>;
    setPrimary(id: string): Promise<ApiResponse<any>>;
    changeRelation(id: string, dto: ChangeRelationTypeDto): Promise<ApiResponse<any>>;
    unlink(id: string): Promise<ApiResponse<any>>;
}
