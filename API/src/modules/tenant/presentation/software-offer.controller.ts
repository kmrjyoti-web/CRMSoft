import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { SoftwareOfferService } from '../services/software-offer.service';
import { CreateSoftwareOfferDto } from './dto/create-software-offer.dto';
import { UpdateSoftwareOfferDto } from './dto/update-software-offer.dto';
import { ApiResponse } from '../../../common/utils/api-response';

@ApiTags('Software Offers')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/offers')
export class SoftwareOfferController {
  constructor(
    private readonly softwareOfferService: SoftwareOfferService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all software offers' })
  async listAll(@Query() query: any) {
    const data = await this.softwareOfferService.listAll(query);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new software offer' })
  async create(@Body() body: CreateSoftwareOfferDto) {
    const offer = await this.softwareOfferService.create({
      name: body.name,
      code: body.code,
      description: body.description,
      offerType: body.offerType,
      value: body.value,
      applicablePlanIds: body.applicablePlanIds,
      validFrom: new Date(body.validFrom),
      validTo: new Date(body.validTo),
      maxRedemptions: body.maxRedemptions,
      autoApply: body.autoApply,
      terms: body.terms,
    });
    return ApiResponse.success(offer, 'Offer created');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get software offer by ID' })
  async getById(@Param('id') id: string) {
    const offer = await this.softwareOfferService.getById(id);
    return ApiResponse.success(offer);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a software offer' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSoftwareOfferDto,
  ) {
    const updateData: any = { ...body };

    // Convert date strings to Date objects if provided
    if (body.validFrom) {
      updateData.validFrom = new Date(body.validFrom);
    }
    if (body.validTo) {
      updateData.validTo = new Date(body.validTo);
    }

    const offer = await this.softwareOfferService.update(id, updateData);
    return ApiResponse.success(offer, 'Offer updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a software offer' })
  async deactivate(@Param('id') id: string) {
    const offer = await this.softwareOfferService.deactivate(id);
    return ApiResponse.success(offer, 'Offer deactivated');
  }

  @Post(':id/redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem a software offer for a tenant' })
  async redeem(
    @Param('id') id: string,
    @Body('tenantId') tenantId: string,
  ) {
    const result = await this.softwareOfferService.redeem(id, tenantId);
    return ApiResponse.success(result, 'Offer redeemed');
  }
}
