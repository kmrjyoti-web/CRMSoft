// @ts-nocheck
import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('public/activities')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicActivitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('activities:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { tenantId: req.tenantId };

    const [data, total] = await Promise.all([
      this.prisma.working.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, type: true, subject: true, description: true,
          outcome: true, duration: true, scheduledAt: true, completedAt: true,
          createdAt: true, updatedAt: true,
          lead: { select: { id: true, leadNumber: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.working.activity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('activities:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const activity = await this.prisma.working.activity.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        lead: { select: { id: true, leadNumber: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!activity) throw new Error('Activity not found');
    return activity;
  }

  @Post()
  @ApiScopes('activities:write')
  async create(@Req() req: any, @Body() body: any) {
    return this.prisma.working.activity.create({
      data: {
        tenantId: req.tenantId,
        type: body.type,
        subject: body.subject,
        description: body.description,
        leadId: body.leadId,
        contactId: body.contactId,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        createdById: body.createdById || req.apiKeyId,
      },
    });
  }
}
