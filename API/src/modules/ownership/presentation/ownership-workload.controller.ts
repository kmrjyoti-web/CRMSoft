import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { GetWorkloadDashboardQuery } from '../application/queries/get-workload-dashboard/get-workload-dashboard.query';
import { GetUserWorkloadQuery } from '../application/queries/get-user-workload/get-user-workload.query';
import { UpdateUserCapacityCommand } from '../application/commands/update-user-capacity/update-user-capacity.command';
import { SetUserAvailabilityCommand } from '../application/commands/set-user-availability/set-user-availability.command';
import { UpdateCapacityDto, SetAvailabilityDto } from './dto/update-capacity.dto';
import { WorkloadService } from '../services/workload.service';

@Controller('ownership/workload')
@UseGuards(AuthGuard('jwt'))
export class OwnershipWorkloadController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly workload: WorkloadService,
  ) {}

  @Get('dashboard')
  @RequirePermissions('ownership:read')
  async getDashboard(@Query() query: any) {
    const result = await this.queryBus.execute(new GetWorkloadDashboardQuery(query.roleId));
    return ApiResponse.success(result);
  }

  @Get('user/:userId')
  @RequirePermissions('ownership:read')
  async getUserWorkload(@Param('userId') userId: string) {
    const result = await this.queryBus.execute(new GetUserWorkloadQuery(userId));
    return ApiResponse.success(result);
  }

  @Put('capacity/:userId')
  @RequirePermissions('ownership:update')
  async updateCapacity(@Param('userId') userId: string, @Body() dto: UpdateCapacityDto) {
    const result = await this.commandBus.execute(new UpdateUserCapacityCommand(userId, dto));
    return ApiResponse.success(result, 'Capacity updated');
  }

  @Post('availability')
  @RequirePermissions('ownership:update')
  async setAvailability(@Body() dto: SetAvailabilityDto, @CurrentUser('id') currentUserId: string) {
    const result = await this.commandBus.execute(new SetUserAvailabilityCommand(
      dto.userId, dto.isAvailable,
      dto.unavailableFrom ? new Date(dto.unavailableFrom) : undefined,
      dto.unavailableTo ? new Date(dto.unavailableTo) : undefined,
      dto.delegateToId, dto.reason, currentUserId,
    ));
    return ApiResponse.success(result, dto.isAvailable ? 'User marked available' : 'User marked unavailable');
  }

  @Get('rebalance-suggestions')
  @RequirePermissions('ownership:read')
  async getRebalanceSuggestions() {
    const result = await this.workload.getRebalanceSuggestions();
    return ApiResponse.success(result);
  }
}
