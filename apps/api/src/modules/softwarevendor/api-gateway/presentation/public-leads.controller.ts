// @ts-nocheck
import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('public/leads')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicLeadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('leads:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { tenantId: req.tenantId };

    if (query.search) {
      where.OR = [
        { leadNumber: { contains: query.search, mode: 'insensitive' } },
        { contact: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.working.lead.findMany({
        where,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, leadNumber: true, status: true, priority: true,
          expectedValue: true, expectedCloseDate: true, notes: true,
          createdAt: true, updatedAt: true,
          contact: { select: { id: true, firstName: true, lastName: true } },
          organization: { select: { id: true, name: true } },
          allocatedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.working.lead.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('leads:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const lead = await this.prisma.working.lead.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, designation: true } },
        organization: { select: { id: true, name: true, industry: true } },
        allocatedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!lead) throw new Error('Lead not found');
    return lead;
  }

  @Post()
  @ApiScopes('leads:write')
  async create(@Req() req: any, @Body() body: any) {
    return this.prisma.working.lead.create({
      data: {
        tenantId: req.tenantId,
        leadNumber: body.leadNumber,
        status: body.status || 'NEW',
        priority: body.priority || 'MEDIUM',
        expectedValue: body.expectedValue,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
        notes: body.notes,
        contactId: body.contactId,
        organizationId: body.organizationId,
        allocatedToId: body.allocatedToId,
        createdById: body.createdById || req.apiKeyId,
      },
    });
  }

  @Put(':id')
  @ApiScopes('leads:write')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    await this.prisma.working.lead.findFirstOrThrow({
      where: { id, tenantId: req.tenantId },
    });
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.expectedValue !== undefined) updateData.expectedValue = body.expectedValue;
    if (body.expectedCloseDate !== undefined) updateData.expectedCloseDate = new Date(body.expectedCloseDate);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.allocatedToId !== undefined) updateData.allocatedToId = body.allocatedToId;
    if (body.organizationId !== undefined) updateData.organizationId = body.organizationId;

    return this.prisma.working.lead.update({ where: { id }, data: updateData });
  }
}
