import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import {
  CreatePriceGroupDto, UpdatePriceGroupDto, AddMemberDto,
} from './dto/customer-price-group.dto';

@ApiTags('Customer Price Groups')
@ApiBearerAuth()
@Controller('price-groups')
export class CustomerPriceGroupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create price group' })
  @RequirePermissions('products:update')
  async create(@Body() dto: CreatePriceGroupDto) {
    const group = await this.prisma.customerPriceGroup.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description,
        discount: dto.discount,
        priority: dto.priority ?? 0,
      },
    });
    return ApiResponse.success(group, 'Price group created');
  }

  @Get()
  @ApiOperation({ summary: 'List price groups' })
  @RequirePermissions('products:read')
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(100, Math.max(1, +limit));
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.customerPriceGroup.findMany({
        where, skip: (p - 1) * l, take: l,
        orderBy: { priority: 'desc' },
      }),
      this.prisma.customerPriceGroup.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get price group with counts' })
  @RequirePermissions('products:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.prisma.customerPriceGroup.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { customers: true, prices: true } },
      },
    });
    return ApiResponse.success(group);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update price group' })
  @RequirePermissions('products:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceGroupDto,
  ) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const group = await this.prisma.customerPriceGroup.update({
      where: { id }, data,
    });
    return ApiResponse.success(group, 'Price group updated');
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate price group' })
  @RequirePermissions('products:update')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.prisma.customerPriceGroup.update({
      where: { id }, data: { isActive: false },
    });
    return ApiResponse.success(group, 'Price group deactivated');
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add customer/org to price group' })
  @RequirePermissions('products:update')
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    const uniqueWhere = dto.contactId
      ? { priceGroupId_contactId: { priceGroupId: id, contactId: dto.contactId } }
      : { priceGroupId_organizationId: { priceGroupId: id, organizationId: dto.organizationId! } };

    const mapping = await this.prisma.customerGroupMapping.upsert({
      where: uniqueWhere as any,
      create: {
        priceGroupId: id,
        contactId: dto.contactId,
        organizationId: dto.organizationId,
        isActive: true,
      },
      update: { isActive: true },
    });
    return ApiResponse.success(mapping, 'Member added to price group');
  }

  @Delete(':id/members/:mappingId')
  @ApiOperation({ summary: 'Remove member from price group' })
  @RequirePermissions('products:update')
  async removeMember(
    @Param('id', ParseUUIDPipe) _id: string,
    @Param('mappingId', ParseUUIDPipe) mappingId: string,
  ) {
    await this.prisma.customerGroupMapping.delete({
      where: { id: mappingId },
    });
    return ApiResponse.success(null, 'Member removed from price group');
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List members of price group' })
  @RequirePermissions('products:read')
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(1, +page);
    const l = Math.min(100, Math.max(1, +limit));
    const where = { priceGroupId: id };
    const [data, total] = await Promise.all([
      this.prisma.customerGroupMapping.findMany({
        where, skip: (p - 1) * l, take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customerGroupMapping.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }
}
