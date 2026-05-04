import {
  Controller, Post, Get, Put, Param, Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
// import { Public } from '../../../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { CreateMenuCommand } from '../application/commands/create-menu/create-menu.command';
import { UpdateMenuCommand } from '../application/commands/update-menu/update-menu.command';
import { ReorderMenusCommand } from '../application/commands/reorder-menus/reorder-menus.command';
import { DeactivateMenuCommand } from '../application/commands/deactivate-menu/deactivate-menu.command';
import { BulkSeedMenusCommand } from '../application/commands/bulk-seed-menus/bulk-seed-menus.command';
import { GetMenuTreeQuery } from '../application/queries/get-menu-tree/get-menu-tree.query';
import { GetMyMenuQuery } from '../application/queries/get-my-menu/get-my-menu.query';
import { GetMenuByIdQuery } from '../application/queries/get-menu-by-id/get-menu-by-id.query';
import { MENU_SEED_DATA } from './menu-seed-data';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

