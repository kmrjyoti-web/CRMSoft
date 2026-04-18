import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class OrganizationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateOrganizationDto, user: any): Promise<ApiResponse<any>>;
    findAll(query: OrganizationQueryDto): Promise<ApiResponse<unknown[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateOrganizationDto): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reactivate(id: string): Promise<ApiResponse<any>>;
    softDelete(id: string, userId: string): Promise<ApiResponse<any>>;
    restore(id: string): Promise<ApiResponse<any>>;
    permanentDelete(id: string): Promise<ApiResponse<{
        id: string;
        deleted: boolean;
    }>>;
}
