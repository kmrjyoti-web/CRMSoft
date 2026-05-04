import {
  Controller, Get, Put, Post, Delete, Param, Body, Query, HttpCode,
} from '@nestjs/common';
import { CurrentUser } from '../../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../../common/utils/api-response';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import {
  MenuPermissionService,
  MenuPermissions,
  PermissionAction,
} from '../application/services/menu-permission.service';

@Controller('menu-permissions')
export class MenuPermissionController {
  constructor(
    private readonly menuPermissionService: MenuPermissionService,
    private readonly prisma: PrismaService,
  ) {}

  // -------------------------------------------------------
  // GET PERMISSIONS
  // -------------------------------------------------------

