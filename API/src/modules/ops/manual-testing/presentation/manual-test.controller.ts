import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateManualTestLogDto, UpdateManualTestLogDto, GetUploadUrlDto } from './dto/manual-test-log.dto';
import { LogManualTestCommand } from '../application/commands/log-manual-test/log-manual-test.command';
import { GetScreenshotUploadUrlCommand } from '../application/commands/get-screenshot-upload-url/get-screenshot-upload-url.command';
import { UpdateManualTestLogCommand } from '../application/commands/update-manual-test-log/update-manual-test-log.command';
import { ListManualTestLogsQuery } from '../application/queries/list-manual-test-logs/list-manual-test-logs.query';
import { GetManualTestLogQuery } from '../application/queries/get-manual-test-log/get-manual-test-log.query';
import { GetManualTestSummaryQuery } from '../application/queries/get-manual-test-summary/get-manual-test-summary.query';

@Controller('ops/manual-test')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class ManualTestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /** POST /ops/manual-test */
  @Post()
  async log(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateManualTestLogDto,
  ) {
    const data = await this.commandBus.execute(new LogManualTestCommand(tenantId, userId, dto));
    return ApiResponse.success(data, 'Test log recorded');
  }

  /** POST /ops/manual-test/upload-url */
  @Post('upload-url')
  async getUploadUrl(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: GetUploadUrlDto,
  ) {
    const data = await this.commandBus.execute(
      new GetScreenshotUploadUrlCommand(tenantId, dto.contentType, dto.filename),
    );
    return ApiResponse.success(data);
  }

  /** GET /ops/manual-test/summary */
  @Get('summary')
  async getSummary(
    @CurrentUser('tenantId') tenantId: string,
    @Query('testRunId') testRunId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetManualTestSummaryQuery(tenantId, { testRunId, from, to }),
    );
    return ApiResponse.success(data);
  }

  /** GET /ops/manual-test */
  @Get()
  async list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('testRunId') testRunId?: string,
    @Query('module') module?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.queryBus.execute(
      new ListManualTestLogsQuery(tenantId, {
        testRunId,
        module,
        status,
        userId,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
    );
    return ApiResponse.success(data);
  }

  /** GET /ops/manual-test/:id */
  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.queryBus.execute(new GetManualTestLogQuery(id));
    return ApiResponse.success(data);
  }

  /** PATCH /ops/manual-test/:id */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateManualTestLogDto,
  ) {
    const data = await this.commandBus.execute(new UpdateManualTestLogCommand(id, dto));
    return ApiResponse.success(data, 'Test log updated');
  }
}
