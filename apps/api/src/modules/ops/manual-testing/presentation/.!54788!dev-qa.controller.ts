import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DevQANotionService } from '../services/dev-qa-notion.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Controller('ops/dev-qa')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class DevQAController {
  constructor(
    private readonly devQAService: DevQANotionService,
    private readonly prisma: PrismaService,
  ) {}

