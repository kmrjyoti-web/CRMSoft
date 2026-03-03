import { Controller, Post, Get, Put, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateTourPlanDto } from './dto/create-tour-plan.dto';
import { UpdateTourPlanDto } from './dto/update-tour-plan.dto';
import { ApproveTourPlanDto, RejectTourPlanDto } from './dto/approve-reject.dto';
import { CheckInDto, CheckOutDto } from './dto/check-in-out.dto';
import { TourPlanQueryDto } from './dto/tour-plan-query.dto';
import { CreateTourPlanCommand } from '../application/commands/create-tour-plan/create-tour-plan.command';
import { UpdateTourPlanCommand } from '../application/commands/update-tour-plan/update-tour-plan.command';
import { SubmitTourPlanCommand } from '../application/commands/submit-tour-plan/submit-tour-plan.command';
import { ApproveTourPlanCommand } from '../application/commands/approve-tour-plan/approve-tour-plan.command';
import { RejectTourPlanCommand } from '../application/commands/reject-tour-plan/reject-tour-plan.command';
import { CheckInVisitCommand } from '../application/commands/check-in-visit/check-in-visit.command';
import { CheckOutVisitCommand } from '../application/commands/check-out-visit/check-out-visit.command';
import { CancelTourPlanCommand } from '../application/commands/cancel-tour-plan/cancel-tour-plan.command';
import { GetTourPlanListQuery } from '../application/queries/get-tour-plan-list/get-tour-plan-list.query';
import { GetTourPlanByIdQuery } from '../application/queries/get-tour-plan-by-id/get-tour-plan-by-id.query';
import { GetTourPlanStatsQuery } from '../application/queries/get-tour-plan-stats/get-tour-plan-stats.query';

@Controller('tour-plans')
export class TourPlanController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('tour-plans:create')
  async create(@Body() dto: CreateTourPlanDto, @CurrentUser('id') userId: string) {
    const visits = dto.visits?.map((v) => ({ ...v, scheduledTime: v.scheduledTime ? new Date(v.scheduledTime) : undefined }));
    const result = await this.commandBus.execute(
      new CreateTourPlanCommand(dto.title, new Date(dto.planDate), userId, dto.leadId, dto.description, dto.startLocation, dto.endLocation, visits),
    );
    return ApiResponse.success(result, 'Tour plan created');
  }

  @Get()
  @RequirePermissions('tour-plans:read')
  async list(@Query() query: TourPlanQueryDto) {
    const result = await this.queryBus.execute(
      new GetTourPlanListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, query.salesPersonId, query.fromDate, query.toDate),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('tour-plans:read')
  async stats(@Query('userId') userId?: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    const result = await this.queryBus.execute(new GetTourPlanStatsQuery(userId, fromDate, toDate));
    return ApiResponse.success(result);
  }

  @Get('user/:userId')
  @RequirePermissions('tour-plans:read')
  async byUser(@Param('userId') userId: string, @Query() query: TourPlanQueryDto) {
    const result = await this.queryBus.execute(
      new GetTourPlanListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, userId, query.fromDate, query.toDate),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('tour-plans:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetTourPlanByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('tour-plans:update')
  async update(@Param('id') id: string, @Body() dto: UpdateTourPlanDto, @CurrentUser('id') userId: string) {
    const data = { ...dto, planDate: dto.planDate ? new Date(dto.planDate) : undefined };
    const result = await this.commandBus.execute(new UpdateTourPlanCommand(id, userId, data));
    return ApiResponse.success(result, 'Tour plan updated');
  }

  @Post(':id/submit')
  @RequirePermissions('tour-plans:update')
  async submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new SubmitTourPlanCommand(id, userId));
    return ApiResponse.success(result, 'Tour plan submitted for approval');
  }

  @Post(':id/approve')
  @RequirePermissions('tour-plans:update')
  async approve(@Param('id') id: string, @Body() dto: ApproveTourPlanDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ApproveTourPlanCommand(id, userId, dto.comment));
    return ApiResponse.success(result, 'Tour plan approved');
  }

  @Post(':id/reject')
  @RequirePermissions('tour-plans:update')
  async reject(@Param('id') id: string, @Body() dto: RejectTourPlanDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new RejectTourPlanCommand(id, userId, dto.reason));
    return ApiResponse.success(result, 'Tour plan rejected');
  }

  @Post(':id/cancel')
  @RequirePermissions('tour-plans:update')
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CancelTourPlanCommand(id, userId));
    return ApiResponse.success(result, 'Tour plan cancelled');
  }

  @Post('visits/:visitId/check-in')
  @RequirePermissions('tour-plans:update')
  async checkIn(@Param('visitId') visitId: string, @Body() dto: CheckInDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CheckInVisitCommand(visitId, userId, dto.latitude, dto.longitude, dto.photoUrl));
    return ApiResponse.success(result, 'Checked in');
  }

  @Post('visits/:visitId/check-out')
  @RequirePermissions('tour-plans:update')
  async checkOut(@Param('visitId') visitId: string, @Body() dto: CheckOutDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CheckOutVisitCommand(visitId, userId, dto.latitude, dto.longitude, dto.photoUrl, dto.outcome, dto.notes));
    return ApiResponse.success(result, 'Checked out');
  }
}
