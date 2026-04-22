import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiScopeGuard } from '../guards/api-scope.guard';
import { ApiRateLimitGuard } from '../guards/api-rate-limit.guard';
import { ApiScopes } from '../decorators/api-scopes.decorator';
import { PaginationQueryDto } from './dto/public-api.dto';

@Controller('public/contacts')
@UseGuards(ApiKeyGuard, ApiScopeGuard, ApiRateLimitGuard)
export class PublicContactsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiScopes('contacts:read')
  async list(@Req() req: any, @Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where: any = { tenantId: req.tenantId, isActive: true };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.working.contact.findMany({
        where,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, firstName: true, lastName: true,
          designation: true, department: true, isActive: true,
          createdAt: true, updatedAt: true,
          organization: { select: { id: true, name: true } },
        },
      }),
      this.prisma.working.contact.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get(':id')
  @ApiScopes('contacts:read')
  async getById(@Req() req: any, @Param('id') id: string) {
    const contact = await this.prisma.working.contact.findFirst({
      where: { id, tenantId: req.tenantId, isActive: true },
      include: {
        organization: { select: { id: true, name: true } },
      },
    });
    if (!contact) throw new Error('Contact not found');
    return contact;
  }

  @Post()
  @ApiScopes('contacts:write')
  async create(@Req() req: any, @Body() body: any) {
    return this.prisma.working.contact.create({
      data: {
        tenantId: req.tenantId,
        firstName: body.firstName,
        lastName: body.lastName || '',
        designation: body.designation,
        department: body.department,
        notes: body.notes,
        organizationId: body.organizationId,
        createdById: body.createdById || req.apiKeyId,
      },
    });
  }

  @Put(':id')
  @ApiScopes('contacts:write')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    await this.prisma.working.contact.findFirstOrThrow({
      where: { id, tenantId: req.tenantId, isActive: true },
    });
    const updateData: any = {};
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.designation !== undefined) updateData.designation = body.designation;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.organizationId !== undefined) updateData.organizationId = body.organizationId;

    return this.prisma.working.contact.update({ where: { id }, data: updateData });
  }
}
