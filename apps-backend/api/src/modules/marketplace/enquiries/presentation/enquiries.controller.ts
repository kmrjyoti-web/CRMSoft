import {
  Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateEnquiryCommand } from '../application/commands/create-enquiry/create-enquiry.command';
import { ConvertEnquiryCommand } from '../application/commands/convert-enquiry/convert-enquiry.command';
import { ListEnquiriesQuery } from '../application/queries/list-enquiries/list-enquiries.query';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';

@ApiTags('Marketplace - Enquiries')
@ApiBearerAuth()
@Controller('marketplace/enquiries')
export class EnquiriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit a product enquiry' })
  async create(
    @Body() dto: CreateEnquiryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const id = await this.commandBus.execute(
      new CreateEnquiryCommand(
        tenantId,
        dto.listingId,
        userId,
        dto.message,
        dto.quantity,
        dto.expectedPrice,
        dto.deliveryPincode,
      ),
    );
    return ApiResponse.success({ id }, 'Enquiry submitted');
  }

  @Get()
  @ApiOperation({ summary: 'List enquiries' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('listingId') listingId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.queryBus.execute(
      new ListEnquiriesQuery(
        tenantId,
        listingId,
        undefined,
        status,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
    return ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
  }

  @Post(':id/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert enquiry to CRM lead' })
  async convert(
    @Param('id') id: string,
    @Body() body: { crmLeadId?: string },
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    await this.commandBus.execute(new ConvertEnquiryCommand(id, tenantId, userId, body.crmLeadId));
    return ApiResponse.success(null, 'Enquiry converted to CRM lead');
  }
}
