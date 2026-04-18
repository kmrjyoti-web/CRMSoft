import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActivatePortalDto } from './dto/activate-portal.dto';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { UpdatePortalUserDto } from './dto/update-portal-user.dto';
export declare class CustomerPortalAdminController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getEligibleEntities(req: {
        user: {
            tenantId: string;
        };
    }, entityType?: string, search?: string, page?: string, limit?: string): Promise<any>;
    activate(req: {
        user: {
            id: string;
            tenantId: string;
        };
    }, dto: ActivatePortalDto): Promise<any>;
    deactivate(customerUserId: string, req: {
        user: {
            tenantId: string;
        };
    }): Promise<any>;
    listPortalUsers(req: {
        user: {
            tenantId: string;
        };
    }, page?: string, limit?: string, search?: string, isActive?: string): Promise<any>;
    getPortalUser(id: string): Promise<any>;
    updatePortalUser(id: string, dto: UpdatePortalUserDto): Promise<any>;
    resetPassword(id: string): Promise<any>;
    createMenuCategory(req: {
        user: {
            id: string;
            tenantId: string;
        };
    }, dto: CreateMenuCategoryDto): Promise<any>;
    listMenuCategories(req: {
        user: {
            tenantId: string;
        };
    }): Promise<any>;
    getMenuCategory(id: string): Promise<any>;
    updateMenuCategory(id: string, dto: UpdateMenuCategoryDto): Promise<any>;
    deleteMenuCategory(id: string): Promise<any>;
    getAvailableRoutes(): {
        key: string;
        label: string;
        icon: string;
        path: string;
    }[];
    getAnalytics(req: {
        user: {
            tenantId: string;
        };
    }, from?: string, to?: string): Promise<any>;
}
