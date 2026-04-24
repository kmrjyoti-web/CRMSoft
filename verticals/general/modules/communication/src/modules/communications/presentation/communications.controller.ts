import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AddCommunicationCommand } from '../application/commands/add-communication/add-communication.command';
import { UpdateCommunicationCommand } from '../application/commands/update-communication/update-communication.command';
import { DeleteCommunicationCommand } from '../application/commands/delete-communication/delete-communication.command';
import { SetPrimaryCommunicationCommand } from '../application/commands/set-primary/set-primary.command';
import { MarkVerifiedCommand } from '../application/commands/mark-verified/mark-verified.command';
import { LinkToEntityCommand } from '../application/commands/link-to-entity/link-to-entity.command';
import { GetCommunicationByIdQuery } from '../application/queries/get-communication-by-id/get-communication-by-id.query';
import { GetCommunicationsByEntityQuery } from '../application/queries/get-communications-by-entity/get-communications-by-entity.query';
import { AddCommunicationDto } from './dto/add-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { LinkToEntityDto } from './dto/link-to-entity.dto';
import { CommunicationsByEntityDto } from './dto/communications-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
export class CommunicationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add communication (phone/email/etc.) to an entity' })
  async add(@Body() dto: AddCommunicationDto) {
    const id = await this.commandBus.execute(
      new AddCommunicationCommand(
        dto.type, dto.value, dto.priorityType, dto.isPrimary,
        dto.label, dto.rawContactId, dto.contactId,
        dto.organizationId, dto.leadId,
      ),
    );
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm, 'Communication added');
  }

  @Get('by-entity')
  @ApiOperation({ summary: 'Get all communications for an entity (contact/rawContact/org/lead)' })
  async findByEntity(@Query() query: CommunicationsByEntityDto) {
    const comms = await this.queryBus.execute(
      new GetCommunicationsByEntityQuery(query.entityType, query.entityId, query.type),
    );
    return ApiResponse.success(comms);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication by ID' })
  async findById(@Param('id') id: string) {
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update communication value/priority/label' })
  async update(@Param('id') id: string, @Body() dto: UpdateCommunicationDto) {
    await this.commandBus.execute(new UpdateCommunicationCommand(id, dto));
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm, 'Communication updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete communication' })
  async remove(@Param('id') id: string) {
    await this.commandBus.execute(new DeleteCommunicationCommand(id));
    return ApiResponse.success(null, 'Communication deleted');
  }

  @Post(':id/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set as primary (unsets other primary of same type)' })
  async setPrimary(@Param('id') id: string) {
    await this.commandBus.execute(new SetPrimaryCommunicationCommand(id));
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm, 'Set as primary');
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark communication as verified (OTP/email confirmed)' })
  async markVerified(@Param('id') id: string) {
    await this.commandBus.execute(new MarkVerifiedCommand(id));
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm, 'Communication verified');
  }

  @Post(':id/link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link communication to an additional entity' })
  async linkToEntity(@Param('id') id: string, @Body() dto: LinkToEntityDto) {
    await this.commandBus.execute(
      new LinkToEntityCommand(id, dto.entityType, dto.entityId),
    );
    const comm = await this.queryBus.execute(new GetCommunicationByIdQuery(id));
    return ApiResponse.success(comm, `Linked to ${dto.entityType}`);
  }
}
