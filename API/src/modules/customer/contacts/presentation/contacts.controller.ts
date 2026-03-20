import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus, UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateContactCommand } from '../application/commands/create-contact/create-contact.command';
import { UpdateContactCommand } from '../application/commands/update-contact/update-contact.command';
import { DeactivateContactCommand } from '../application/commands/deactivate-contact/deactivate-contact.command';
import { ReactivateContactCommand } from '../application/commands/reactivate-contact/reactivate-contact.command';
import { SoftDeleteContactCommand } from '../application/commands/soft-delete-contact/soft-delete-contact.command';
import { RestoreContactCommand } from '../application/commands/restore-contact/restore-contact.command';
import { PermanentDeleteContactCommand } from '../application/commands/permanent-delete-contact/permanent-delete-contact.command';
import { GetContactByIdQuery } from '../application/queries/get-contact-by-id/get-contact-by-id.query';
import { GetContactsListQuery } from '../application/queries/get-contacts-list/get-contacts-list.query';
import { GetContactsDashboardQuery } from '../application/queries/get-contacts-dashboard/get-contacts-dashboard.query';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DataMaskingInterceptor, MaskTable } from '../../../softwarevendor/table-config/data-masking.interceptor';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create verified contact directly (with comms + org link)' })
  async create(@Body() dto: CreateContactDto, @CurrentUser('id') userId: string) {
    const id = await this.commandBus.execute(
      new CreateContactCommand(
        dto.firstName, dto.lastName, userId,
        dto.designation, dto.department, dto.notes,
        dto.communications, dto.organizationId, dto.orgRelationType,
        dto.filterIds,
      ),
    );
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact created');
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'CRM dashboard stats, charts, and recent contacts' })
  async getDashboard(
    @CurrentUser('tenantId') tenantId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetContactsDashboardQuery(tenantId, dateFrom, dateTo),
    );
    return ApiResponse.success(result);
  }

  @Get()
  @UseInterceptors(DataMaskingInterceptor)
  @MaskTable('contacts')
  @ApiOperation({ summary: 'List contacts (paginated, search across name/phone/email/org)' })
  async findAll(@Query() query: ContactQueryDto) {
    const result = await this.queryBus.execute(
      new GetContactsListQuery(
        query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc',
        query.search, query.isActive, query.designation,
        query.department, query.organizationId,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID (with comms, orgs, leads, filters, raw contacts)' })
  async findById(@Param('id') id: string) {
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact (active only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.commandBus.execute(
      new UpdateContactCommand(id, userId, dto, dto.filterIds, dto.communications, dto.organizationId),
    );
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate contact (soft delete)' })
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateContactCommand(id));
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact deactivated');
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate deactivated contact' })
  async reactivate(@Param('id') id: string) {
    await this.commandBus.execute(new ReactivateContactCommand(id));
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact reactivated');
  }

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete contact (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteContactCommand(id, userId));
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted contact' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreContactCommand(id));
    const contact = await this.queryBus.execute(new GetContactByIdQuery(id));
    return ApiResponse.success(contact, 'Contact restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted contact (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteContactCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'Contact permanently deleted');
  }
}
