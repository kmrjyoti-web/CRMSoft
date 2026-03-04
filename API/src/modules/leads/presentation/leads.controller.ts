import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateLeadCommand } from '../application/commands/create-lead/create-lead.command';
import { AllocateLeadCommand } from '../application/commands/allocate-lead/allocate-lead.command';
import { ChangeLeadStatusCommand } from '../application/commands/change-lead-status/change-lead-status.command';
import { UpdateLeadCommand } from '../application/commands/update-lead/update-lead.command';
import { GetLeadByIdQuery } from '../application/queries/get-lead-by-id/get-lead-by-id.query';
import { GetLeadsListQuery } from '../application/queries/get-leads-list/get-leads-list.query';
import { CreateLeadDto } from './dto/create-lead.dto';
import { AllocateLeadDto } from './dto/allocate-lead.dto';
import { ChangeLeadStatusDto } from './dto/change-lead-status.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { DeactivateLeadCommand } from '../application/commands/deactivate-lead/deactivate-lead.command';
import { ReactivateLeadCommand } from '../application/commands/reactivate-lead/reactivate-lead.command';
import { SoftDeleteLeadCommand } from '../application/commands/soft-delete-lead/soft-delete-lead.command';
import { RestoreLeadCommand } from '../application/commands/restore-lead/restore-lead.command';
import { PermanentDeleteLeadCommand } from '../application/commands/permanent-delete-lead/permanent-delete-lead.command';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { DataMaskingInterceptor, MaskTable } from '../../table-config/data-masking.interceptor';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new lead for a verified contact' })
  async create(@Body() dto: CreateLeadDto, @CurrentUser('id') userId: string) {
    const id = await this.commandBus.execute(
      new CreateLeadCommand(
        dto.contactId, userId, dto.organizationId, dto.priority,
        dto.expectedValue,
        dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
        dto.notes, dto.filterIds,
      ),
    );
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead created');
  }

  @Get()
  @UseInterceptors(DataMaskingInterceptor)
  @MaskTable('leads')
  @ApiOperation({ summary: 'List leads (paginated, filtered by status/priority/owner/contact/org)' })
  async findAll(@Query() query: LeadQueryDto) {
    const result = await this.queryBus.execute(
      new GetLeadsListQuery(
        query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc',
        query.search, query.isActive, query.status, query.priority,
        query.allocatedToId, query.contactId, query.organizationId,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID (contact, org, activities, demos, quotations, filters)' })
  async findById(@Param('id') id: string) {
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead details (non-terminal only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    await this.commandBus.execute(
      new UpdateLeadCommand(id, {
        priority: dto.priority,
        expectedValue: dto.expectedValue,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
        notes: dto.notes,
      }, dto.filterIds),
    );
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead updated');
  }

  @Post(':id/allocate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Allocate lead to sales executive (NEW/VERIFIED only)' })
  async allocate(@Param('id') id: string, @Body() dto: AllocateLeadDto) {
    await this.commandBus.execute(
      new AllocateLeadCommand(id, dto.allocatedToId),
    );
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead allocated');
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change lead status (state machine validated)' })
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeLeadStatusDto) {
    await this.commandBus.execute(
      new ChangeLeadStatusCommand(id, dto.status, dto.reason),
    );
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, `Status changed to ${dto.status}`);
  }

  @Get(':id/transitions')
  @ApiOperation({ summary: 'Get valid next statuses for a lead' })
  async getTransitions(@Param('id') id: string) {
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success({
      currentStatus: lead.status,
      validNextStatuses: lead.validNextStatuses,
      isTerminal: lead.isTerminal,
    });
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate lead (hide from default views)' })
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateLeadCommand(id));
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead deactivated');
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate deactivated lead' })
  async reactivate(@Param('id') id: string) {
    await this.commandBus.execute(new ReactivateLeadCommand(id));
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead reactivated');
  }

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete lead (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteLeadCommand(id, userId));
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted lead' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreLeadCommand(id));
    const lead = await this.queryBus.execute(new GetLeadByIdQuery(id));
    return ApiResponse.success(lead, 'Lead restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted lead (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteLeadCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'Lead permanently deleted');
  }
}
