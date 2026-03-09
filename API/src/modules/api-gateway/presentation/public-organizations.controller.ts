import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('organizations')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicOrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('organizations:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { tenantId: req.tenantId, isActive: true };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, industry: true, website: true,
          gstNumber: true, orgType: true, address: true,
          city: true, state: true, country: true, pincode: true,
          isActive: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('organizations:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id, tenantId: req.tenantId, isActive: true },
    });
    if (!org) throw new Error('Organization not found');
    return org;
  }

  @Post()
  @ApiScopes('organizations:write')
  async create(@Req() req: any, @Body() body: any) {
    return this.prisma.organization.create({
      data: {
        tenantId: req.tenantId,
        name: body.name,
        industry: body.industry,
        website: body.website,
        gstNumber: body.gstNumber,
        orgType: body.orgType,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        pincode: body.pincode,
        notes: body.notes,
        createdById: body.createdById || req.apiKeyId,
      },
    });
  }

  @Put(':id')
  @ApiScopes('organizations:write')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    await this.prisma.organization.findFirstOrThrow({
      where: { id, tenantId: req.tenantId, isActive: true },
    });
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.gstNumber !== undefined) updateData.gstNumber = body.gstNumber;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.pincode !== undefined) updateData.pincode = body.pincode;
    if (body.notes !== undefined) updateData.notes = body.notes;

    return this.prisma.organization.update({ where: { id }, data: updateData });
  }
}
