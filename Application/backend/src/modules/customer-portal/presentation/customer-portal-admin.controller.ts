import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CUSTOMER_PORTAL_ROUTES } from '../data/portal-routes';
import { ActivatePortalDto } from './dto/activate-portal.dto';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { UpdatePortalUserDto } from './dto/update-portal-user.dto';
import { ActivatePortalCommand } from '../application/commands/activate-portal/activate-portal.command';
import { DeactivatePortalCommand } from '../application/commands/deactivate-portal/deactivate-portal.command';
import { UpdatePortalUserCommand } from '../application/commands/update-portal-user/update-portal-user.command';
import { AdminResetCustomerPasswordCommand } from '../application/commands/admin-reset-customer-password/admin-reset-customer-password.command';
import { CreateMenuCategoryCommand } from '../application/commands/create-menu-category/create-menu-category.command';
import { UpdateMenuCategoryCommand } from '../application/commands/update-menu-category/update-menu-category.command';
import { DeleteMenuCategoryCommand } from '../application/commands/delete-menu-category/delete-menu-category.command';
import { GetEligibleEntitiesQuery } from '../application/queries/get-eligible-entities/get-eligible-entities.query';
import { ListPortalUsersQuery } from '../application/queries/list-portal-users/list-portal-users.query';
import { GetPortalUserQuery } from '../application/queries/get-portal-user/get-portal-user.query';
import { ListMenuCategoriesQuery } from '../application/queries/list-menu-categories/list-menu-categories.query';
import { GetMenuCategoryQuery } from '../application/queries/get-menu-category/get-menu-category.query';
import { GetPortalAnalyticsQuery } from '../application/queries/get-portal-analytics/get-portal-analytics.query';

@ApiTags('Customer Portal — Admin Management')
@ApiBearerAuth()
@Controller('admin/customer-portal')
export class CustomerPortalAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ═══ ACTIVATION ═══════════════════════════════════════

  @Get('eligible')
  @ApiOperation({ summary: 'Get verified entities eligible for portal activation' })
  @ApiQuery({ name: 'entityType', required: false, enum: ['CONTACT', 'ORGANIZATION', 'LEDGER'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getEligibleEntities(
    @Request() req: { user: { tenantId: string } },
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.queryBus.execute(
      new GetEligibleEntitiesQuery(
        req.user.tenantId,
        entityType,
        search,
        parseInt(page, 10),
        parseInt(limit, 10),
      ),
    );
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate portal login for a verified entity' })
  activate(
    @Request() req: { user: { id: string; tenantId: string } },
    @Body() dto: ActivatePortalDto,
  ) {
    return this.commandBus.execute(
      new ActivatePortalCommand(
        req.user.tenantId,
        req.user.id,
        dto.entityType,
        dto.entityId,
        dto.menuCategoryId,
        dto.channels,
        dto.customMessage,
      ),
    );
  }

  @Post('deactivate/:customerUserId')
  @ApiOperation({ summary: 'Deactivate portal access for a customer' })
  deactivate(
    @Param('customerUserId') customerUserId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.commandBus.execute(
      new DeactivatePortalCommand(req.user.tenantId, customerUserId),
    );
  }

  // ═══ USER MANAGEMENT ══════════════════════════════════

  @Get('users')
  @ApiOperation({ summary: 'List all activated portal users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  listPortalUsers(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.queryBus.execute(
      new ListPortalUsersQuery(
        req.user.tenantId,
        parseInt(page, 10),
        parseInt(limit, 10),
        search,
        isActive !== undefined ? isActive === 'true' : undefined,
      ),
    );
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get portal user detail' })
  getPortalUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetPortalUserQuery(id));
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update portal user (category, overrides, status)' })
  updatePortalUser(@Param('id') id: string, @Body() dto: UpdatePortalUserDto) {
    return this.commandBus.execute(
      new UpdatePortalUserCommand(id, dto.menuCategoryId, dto.pageOverrides, dto.isActive),
    );
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'Admin reset customer password — sends new credentials' })
  resetPassword(@Param('id') id: string) {
    return this.commandBus.execute(new AdminResetCustomerPasswordCommand(id));
  }

  // ═══ MENU CATEGORIES ══════════════════════════════════

  @Post('menu-categories')
  @ApiOperation({ summary: 'Create a menu category' })
  createMenuCategory(
    @Request() req: { user: { id: string; tenantId: string } },
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.commandBus.execute(
      new CreateMenuCategoryCommand(
        req.user.tenantId,
        req.user.id,
        dto.name,
        dto.enabledRoutes,
        dto.nameHi,
        dto.description,
        dto.icon,
        dto.color,
        dto.isDefault,
        dto.sortOrder,
      ),
    );
  }

  @Get('menu-categories')
  @ApiOperation({ summary: 'List all menu categories' })
  listMenuCategories(@Request() req: { user: { tenantId: string } }) {
    return this.queryBus.execute(new ListMenuCategoriesQuery(req.user.tenantId));
  }

  @Get('menu-categories/:id')
  @ApiOperation({ summary: 'Get menu category detail' })
  getMenuCategory(@Param('id') id: string) {
    return this.queryBus.execute(new GetMenuCategoryQuery(id));
  }

  @Patch('menu-categories/:id')
  @ApiOperation({ summary: 'Update menu category' })
  updateMenuCategory(@Param('id') id: string, @Body() dto: UpdateMenuCategoryDto) {
    return this.commandBus.execute(new UpdateMenuCategoryCommand(id, dto));
  }

  @Delete('menu-categories/:id')
  @ApiOperation({ summary: 'Delete menu category (soft delete, fails if users assigned)' })
  deleteMenuCategory(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteMenuCategoryCommand(id));
  }

  // ═══ AVAILABLE ROUTES ════════════════════════════════

  @Get('available-routes')
  @ApiOperation({ summary: 'Get all available customer portal pages (for menu builder UI)' })
  getAvailableRoutes() {
    return CUSTOMER_PORTAL_ROUTES.map((r) => ({
      key: r.route,
      label: r.name,
      icon: r.icon,
      path: r.route,
    }));
  }

  // ═══ ANALYTICS ════════════════════════════════════════

  @Get('analytics')
  @ApiOperation({ summary: 'Portal usage analytics' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date string' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date string' })
  getAnalytics(
    @Request() req: { user: { tenantId: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.queryBus.execute(new GetPortalAnalyticsQuery(req.user.tenantId, from, to));
  }
}
