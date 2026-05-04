import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TestErrorAnalyzerService } from '../infrastructure/services/test-error-analyzer.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Controller('ops/test-error')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class TestErrorController {
  constructor(
    private readonly errorAnalyzer: TestErrorAnalyzerService,
    private readonly prisma: PrismaService,
  ) {}

