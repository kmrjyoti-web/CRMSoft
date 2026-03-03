import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateRawContactCommand } from '../application/commands/create-raw-contact/create-raw-contact.command';
import { VerifyRawContactCommand } from '../application/commands/verify-raw-contact/verify-raw-contact.command';
import { RejectRawContactCommand } from '../application/commands/reject-raw-contact/reject-raw-contact.command';
import { MarkDuplicateCommand } from '../application/commands/mark-duplicate/mark-duplicate.command';
import { ReopenRawContactCommand } from '../application/commands/reopen-raw-contact/reopen-raw-contact.command';
import { UpdateRawContactCommand } from '../application/commands/update-raw-contact/update-raw-contact.command';
import { DeactivateRawContactCommand } from '../application/commands/deactivate-raw-contact/deactivate-raw-contact.command';
import { ReactivateRawContactCommand } from '../application/commands/reactivate-raw-contact/reactivate-raw-contact.command';
import { SoftDeleteRawContactCommand } from '../application/commands/soft-delete-raw-contact/soft-delete-raw-contact.command';
import { RestoreRawContactCommand } from '../application/commands/restore-raw-contact/restore-raw-contact.command';
import { PermanentDeleteRawContactCommand } from '../application/commands/permanent-delete-raw-contact/permanent-delete-raw-contact.command';
import { GetRawContactByIdQuery } from '../application/queries/get-raw-contact-by-id/get-raw-contact-by-id.query';
import { GetRawContactsListQuery } from '../application/queries/get-raw-contacts-list/get-raw-contacts-list.query';
import { CreateRawContactDto } from './dto/create-raw-contact.dto';
import { VerifyRawContactDto } from './dto/verify-raw-contact.dto';
import { RejectRawContactDto } from './dto/reject-raw-contact.dto';
import { UpdateRawContactDto } from './dto/update-raw-contact.dto';
import { RawContactQueryDto } from './dto/raw-contact-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Raw Contacts')
@ApiBearerAuth()
@Controller('raw-contacts')
export class RawContactsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new raw contact with communications' })
  async create(@Body() dto: CreateRawContactDto, @CurrentUser('id') userId: string) {
    const id = await this.commandBus.execute(
      new CreateRawContactCommand(
        dto.firstName, dto.lastName, userId, dto.source,
        dto.companyName, dto.designation, dto.department,
        dto.notes, dto.communications, dto.filterIds,
      ),
    );
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact created');
  }

  @Get()
  @ApiOperation({ summary: 'List raw contacts (paginated, filtered)' })
  async findAll(@Query() query: RawContactQueryDto) {
    const result = await this.queryBus.execute(
      new GetRawContactsListQuery(
        query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc',
        query.search, query.isActive, query.status, query.source,
        query.companyName, query.firstName, query.lastName,
        query.createdAtFrom, query.createdAtTo,
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get raw contact by ID (with communications)' })
  async findById(@Param('id') id: string) {
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update raw contact (RAW status only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRawContactDto,
  ) {
    await this.commandBus.execute(new UpdateRawContactCommand(id, dto));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact updated');
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify RAW → creates Contact + updates Communications' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyRawContactDto,
    @CurrentUser('id') userId: string,
  ) {
    const contactId = await this.commandBus.execute(
      new VerifyRawContactCommand(id, userId, dto.organizationId, dto.contactOrgRelationType),
    );
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success({ ...rc, contactId }, 'Raw contact verified → Contact created');
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject raw contact' })
  async reject(@Param('id') id: string, @Body() dto: RejectRawContactDto) {
    await this.commandBus.execute(new RejectRawContactCommand(id, dto.reason));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact rejected');
  }

  @Post(':id/mark-duplicate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark raw contact as duplicate' })
  async markDuplicate(@Param('id') id: string) {
    await this.commandBus.execute(new MarkDuplicateCommand(id));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Marked as duplicate');
  }

  @Post(':id/reopen')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reopen rejected raw contact → back to RAW' })
  async reopen(@Param('id') id: string) {
    await this.commandBus.execute(new ReopenRawContactCommand(id));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact reopened');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate raw contact (hide from default views)' })
  async deactivate(@Param('id') id: string) {
    await this.commandBus.execute(new DeactivateRawContactCommand(id));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact deactivated');
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate deactivated raw contact' })
  async reactivate(@Param('id') id: string) {
    await this.commandBus.execute(new ReactivateRawContactCommand(id));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact reactivated');
  }

  @Post(':id/soft-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete raw contact (mark as deleted, recoverable)' })
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new SoftDeleteRawContactCommand(id, userId));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact soft-deleted');
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted raw contact' })
  async restore(@Param('id') id: string) {
    await this.commandBus.execute(new RestoreRawContactCommand(id));
    const rc = await this.queryBus.execute(new GetRawContactByIdQuery(id));
    return ApiResponse.success(rc, 'Raw contact restored');
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a soft-deleted raw contact (irreversible)' })
  async permanentDelete(@Param('id') id: string) {
    await this.commandBus.execute(new PermanentDeleteRawContactCommand(id));
    return ApiResponse.success({ id, deleted: true }, 'Raw contact permanently deleted');
  }
}
