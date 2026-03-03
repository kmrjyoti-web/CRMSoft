import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LinkContactToOrgCommand } from '../application/commands/link-contact-to-org/link-contact-to-org.command';
import { UnlinkContactFromOrgCommand } from '../application/commands/unlink-contact-from-org/unlink-contact-from-org.command';
import { SetPrimaryContactCommand } from '../application/commands/set-primary-contact/set-primary-contact.command';
import { ChangeRelationTypeCommand } from '../application/commands/change-relation-type/change-relation-type.command';
import { UpdateMappingCommand } from '../application/commands/update-mapping/update-mapping.command';
import { GetContactOrgByIdQuery } from '../application/queries/get-by-id/get-by-id.query';
import { GetOrgsByContactQuery } from '../application/queries/get-by-contact/get-by-contact.query';
import { GetContactsByOrgQuery } from '../application/queries/get-by-organization/get-by-organization.query';
import { LinkContactToOrgDto } from './dto/link-contact-to-org.dto';
import { ChangeRelationTypeDto } from './dto/change-relation-type.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Contact Organizations')
@ApiBearerAuth()
@Controller('contact-organizations')
export class ContactOrganizationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Link contact to organization' })
  async link(@Body() dto: LinkContactToOrgDto) {
    const id = await this.commandBus.execute(
      new LinkContactToOrgCommand(
        dto.contactId, dto.organizationId, dto.relationType,
        dto.isPrimary, dto.designation, dto.department,
        dto.startDate ? new Date(dto.startDate) : undefined,
      ),
    );
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping, 'Contact linked to organization');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mapping by ID' })
  async findById(@Param('id') id: string) {
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping);
  }

  @Get('by-contact/:contactId')
  @ApiOperation({ summary: 'Get all organizations for a contact' })
  async findByContact(
    @Param('contactId') contactId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const orgs = await this.queryBus.execute(
      new GetOrgsByContactQuery(contactId, activeOnly !== 'false'),
    );
    return ApiResponse.success(orgs);
  }

  @Get('by-org/:organizationId')
  @ApiOperation({ summary: 'Get all contacts for an organization (with primary comms)' })
  async findByOrg(
    @Param('organizationId') orgId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const contacts = await this.queryBus.execute(
      new GetContactsByOrgQuery(orgId, activeOnly !== 'false'),
    );
    return ApiResponse.success(contacts);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update mapping (designation/department)' })
  async update(@Param('id') id: string, @Body() dto: UpdateMappingDto) {
    await this.commandBus.execute(new UpdateMappingCommand(id, dto));
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping, 'Mapping updated');
  }

  @Post(':id/set-primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set contact as primary for the organization' })
  async setPrimary(@Param('id') id: string) {
    await this.commandBus.execute(new SetPrimaryContactCommand(id));
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping, 'Set as primary contact');
  }

  @Post(':id/change-relation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change relation type (EMPLOYEE → DIRECTOR, etc.)' })
  async changeRelation(@Param('id') id: string, @Body() dto: ChangeRelationTypeDto) {
    await this.commandBus.execute(new ChangeRelationTypeCommand(id, dto.relationType));
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping, `Relation changed to ${dto.relationType}`);
  }

  @Post(':id/unlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink contact from organization (soft delete)' })
  async unlink(@Param('id') id: string) {
    await this.commandBus.execute(new UnlinkContactFromOrgCommand(id));
    const mapping = await this.queryBus.execute(new GetContactOrgByIdQuery(id));
    return ApiResponse.success(mapping, 'Contact unlinked from organization');
  }
}
