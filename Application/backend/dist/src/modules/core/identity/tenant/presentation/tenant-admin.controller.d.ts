import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class TenantAdminController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTenantDto): Promise<ApiResponse<any>>;
    findAll(query: TenantQueryDto): Promise<ApiResponse<unknown[]>>;
    listSuperAdmins(): Promise<ApiResponse<any>>;
    createSuperAdmin(dto: CreateSuperAdminDto): Promise<ApiResponse<any>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateTenantDto): Promise<ApiResponse<any>>;
    suspend(id: string): Promise<ApiResponse<any>>;
    activate(id: string): Promise<ApiResponse<any>>;
    getUsage(id: string): Promise<ApiResponse<any>>;
    getDashboard(id: string): Promise<ApiResponse<any>>;
}
