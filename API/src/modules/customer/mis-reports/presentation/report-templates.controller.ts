import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('mis-reports/templates')
@UseGuards(AuthGuard('jwt'))
export class ReportTemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @RequirePermissions('reports:create')
  async create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    let reportDefId: string | undefined;
    if (dto.reportCode) {
      const def = await this.prisma.working.reportDefinition.findFirst({
        where: { code: dto.reportCode, tenantId },
      });
      if (def) reportDefId = def.id;
    }

    const template = await this.prisma.working.reportTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        reportDefId,
        layout: dto.layout,
        dataSource: dto.dataSource ?? undefined,
        isPublic: dto.isPublic ?? false,
        createdById: userId,
      },
      include: { reportDef: true },
    });

    return ApiResponse.success(template, 'Report template created');
  }

  @Get()
  @RequirePermissions('reports:read')
  async list(
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const templates = await this.prisma.working.reportTemplate.findMany({
      where: {
        tenantId,
        OR: [{ createdById: userId }, { isPublic: true }],
      },
      include: { reportDef: true },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(templates, 'Report templates retrieved');
  }

  @Get(':id')
  @RequirePermissions('reports:read')
  async getById(@Param('id') id: string, @CurrentUser('tenantId') tenantId: string) {
    const template = await this.prisma.working.reportTemplate.findFirst({
      where: { id, tenantId },
      include: { reportDef: true },
    });
    if (!template) throw new NotFoundException('Report template not found');
    return ApiResponse.success(template, 'Report template retrieved');
  }

  @Patch(':id')
  @RequirePermissions('reports:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    const existing = await this.prisma.working.reportTemplate.findFirst({
      where: { id, createdById: userId },
    });
    if (!existing) throw new NotFoundException('Report template not found');

    const updated = await this.prisma.working.reportTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.layout !== undefined && { layout: dto.layout }),
        ...(dto.dataSource !== undefined && { dataSource: dto.dataSource }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
      include: { reportDef: true },
    });

    return ApiResponse.success(updated, 'Report template updated');
  }

  @Delete(':id')
  @RequirePermissions('reports:delete')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.prisma.working.reportTemplate.deleteMany({
      where: { id, createdById: userId },
    });
    if (result.count === 0) throw new NotFoundException('Report template not found');
    return ApiResponse.success(null, 'Report template deleted');
  }
}
