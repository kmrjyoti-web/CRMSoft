import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
export declare class MenusController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly prisma;
    constructor(commandBus: CommandBus, queryBus: QueryBus, prisma: PrismaService);
    create(dto: CreateMenuDto): Promise<ApiResponse<any>>;
    getTree(user: any): Promise<ApiResponse<any>>;
    getMyMenu(user: any): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateMenuDto): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reorder(dto: ReorderMenusDto): Promise<ApiResponse<any>>;
    seed(user: any): Promise<ApiResponse<any>>;
    getDiscovery(user: any): Promise<ApiResponse<{
        totalRoutes: number;
        mappedRoutes: number;
        unmappedRoutes: {
            route: string | null;
            name: string;
            category: string;
        }[];
        categories: Record<string, unknown[]>;
    }>>;
    refreshDiscovery(user: any): Promise<ApiResponse<{
        unmapped: number;
        message: string;
    }>>;
    private getRouteCategory;
    private getDefaultTenantId;
}
