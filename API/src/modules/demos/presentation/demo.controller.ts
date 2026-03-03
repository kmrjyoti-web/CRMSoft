import { Controller, Post, Get, Put, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { RescheduleDemoDto } from './dto/reschedule-demo.dto';
import { CompleteDemoDto } from './dto/complete-demo.dto';
import { CancelDemoDto } from './dto/cancel-demo.dto';
import { DemoQueryDto } from './dto/demo-query.dto';
import { CreateDemoCommand } from '../application/commands/create-demo/create-demo.command';
import { UpdateDemoCommand } from '../application/commands/update-demo/update-demo.command';
import { RescheduleDemoCommand } from '../application/commands/reschedule-demo/reschedule-demo.command';
import { CompleteDemoCommand } from '../application/commands/complete-demo/complete-demo.command';
import { CancelDemoCommand } from '../application/commands/cancel-demo/cancel-demo.command';
import { GetDemoListQuery } from '../application/queries/get-demo-list/get-demo-list.query';
import { GetDemoByIdQuery } from '../application/queries/get-demo-by-id/get-demo-by-id.query';
import { GetDemosByLeadQuery } from '../application/queries/get-demos-by-lead/get-demos-by-lead.query';
import { GetDemoStatsQuery } from '../application/queries/get-demo-stats/get-demo-stats.query';

@Controller('demos')
export class DemoController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('demos:create')
  async create(@Body() dto: CreateDemoDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateDemoCommand(dto.leadId, userId, dto.mode, new Date(dto.scheduledAt), dto.duration, dto.meetingLink, dto.location, dto.notes),
    );
    return ApiResponse.success(result, 'Demo scheduled');
  }

  @Get()
  @RequirePermissions('demos:read')
  async list(@Query() query: DemoQueryDto) {
    const result = await this.queryBus.execute(
      new GetDemoListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, query.mode, query.conductedById, query.fromDate, query.toDate),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('demos:read')
  async stats(@Query('userId') userId?: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    const result = await this.queryBus.execute(new GetDemoStatsQuery(userId, fromDate, toDate));
    return ApiResponse.success(result);
  }

  @Get('lead/:leadId')
  @RequirePermissions('demos:read')
  async byLead(@Param('leadId') leadId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.queryBus.execute(new GetDemosByLeadQuery(leadId, +page, +limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('demos:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetDemoByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('demos:update')
  async update(@Param('id') id: string, @Body() dto: UpdateDemoDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UpdateDemoCommand(id, userId, dto as any));
    return ApiResponse.success(result, 'Demo updated');
  }

  @Post(':id/reschedule')
  @RequirePermissions('demos:update')
  async reschedule(@Param('id') id: string, @Body() dto: RescheduleDemoDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new RescheduleDemoCommand(id, userId, new Date(dto.scheduledAt), dto.reason));
    return ApiResponse.success(result, 'Demo rescheduled');
  }

  @Post(':id/complete')
  @RequirePermissions('demos:update')
  async complete(@Param('id') id: string, @Body() dto: CompleteDemoDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CompleteDemoCommand(id, userId, dto.result, dto.outcome, dto.notes));
    return ApiResponse.success(result, 'Demo completed');
  }

  @Post(':id/cancel')
  @RequirePermissions('demos:update')
  async cancel(@Param('id') id: string, @Body() dto: CancelDemoDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CancelDemoCommand(id, userId, dto.reason, dto.isNoShow));
    return ApiResponse.success(result, 'Demo cancelled');
  }
}
