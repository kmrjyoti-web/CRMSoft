import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from './dto/update-recurrence.dto';
import { RecurrenceQueryDto } from './dto/recurrence-query.dto';
import { CreateRecurrenceCommand } from '../application/commands/create-recurrence/create-recurrence.command';
import { UpdateRecurrenceCommand } from '../application/commands/update-recurrence/update-recurrence.command';
import { CancelRecurrenceCommand } from '../application/commands/cancel-recurrence/cancel-recurrence.command';
import { GetRecurrenceListQuery } from '../application/queries/get-recurrence-list/get-recurrence-list.query';
import { GetRecurrenceByIdQuery } from '../application/queries/get-recurrence-by-id/get-recurrence-by-id.query';

@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('recurrence:create')
  async create(@Body() dto: CreateRecurrenceDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateRecurrenceCommand(
        dto.entityType, dto.pattern, new Date(dto.startDate), userId, dto.templateData,
        dto.entityId, dto.interval, dto.daysOfWeek, dto.dayOfMonth,
        dto.endDate ? new Date(dto.endDate) : undefined, dto.maxOccurrences,
      ),
    );
    return ApiResponse.success(result, 'Recurring event created');
  }

  @Get()
  @RequirePermissions('recurrence:read')
  async list(@Query() query: RecurrenceQueryDto) {
    const result = await this.queryBus.execute(
      new GetRecurrenceListQuery(query.page, query.limit, query.createdById, query.pattern, query.isActive),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @RequirePermissions('recurrence:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetRecurrenceByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('recurrence:update')
  async update(@Param('id') id: string, @Body() dto: UpdateRecurrenceDto, @CurrentUser('id') userId: string) {
    const data = { ...dto, endDate: dto.endDate ? new Date(dto.endDate) : undefined };
    const result = await this.commandBus.execute(new UpdateRecurrenceCommand(id, userId, data));
    return ApiResponse.success(result, 'Recurring event updated');
  }

  @Delete(':id')
  @RequirePermissions('recurrence:delete')
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CancelRecurrenceCommand(id, userId));
    return ApiResponse.success(result, 'Recurring event cancelled');
  }
}
