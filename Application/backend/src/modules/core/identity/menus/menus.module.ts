import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { MenusController } from './presentation/menus.controller';
import { MenuPermissionController } from './presentation/menu-permission.controller';
import { CreateMenuHandler } from './application/commands/create-menu/create-menu.handler';
import { UpdateMenuHandler } from './application/commands/update-menu/update-menu.handler';
import { ReorderMenusHandler } from './application/commands/reorder-menus/reorder-menus.handler';
import { DeactivateMenuHandler } from './application/commands/deactivate-menu/deactivate-menu.handler';
import { BulkSeedMenusHandler } from './application/commands/bulk-seed-menus/bulk-seed-menus.handler';
import { GetMenuTreeHandler } from './application/queries/get-menu-tree/get-menu-tree.handler';
import { GetMyMenuHandler } from './application/queries/get-my-menu/get-my-menu.handler';
import { GetMenuByIdHandler } from './application/queries/get-menu-by-id/get-menu-by-id.handler';
import { MenuPermissionService } from './application/services/menu-permission.service';

const CommandHandlers = [
  CreateMenuHandler, UpdateMenuHandler, ReorderMenusHandler,
  DeactivateMenuHandler, BulkSeedMenusHandler,
];

const QueryHandlers = [
  GetMenuTreeHandler, GetMyMenuHandler, GetMenuByIdHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [MenusController, MenuPermissionController],
  providers: [...CommandHandlers, ...QueryHandlers, MenuPermissionService, PrismaService],
  exports: [MenuPermissionService],
})
export class MenusModule {}
