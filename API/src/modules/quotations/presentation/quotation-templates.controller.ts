import { Controller, Post, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../common/utils/api-response';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GetTemplatesQuery } from '../application/queries/get-templates/get-templates.query';
import { CreateFromTemplateCommand } from '../application/commands/create-from-template/create-from-template.command';

@Controller('quotation-templates')
@UseGuards(AuthGuard('jwt'))
export class QuotationTemplatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @RequirePermissions('quotations:create')
  async create(@Body() dto: any, @CurrentUser() user: any) {
    const template = await this.prisma.quotationTemplate.create({
      data: {
        name: dto.name, description: dto.description, industry: dto.industry,
        defaultItems: dto.defaultItems, defaultTerms: dto.defaultTerms,
        defaultPayment: dto.defaultPayment, defaultDelivery: dto.defaultDelivery,
        defaultWarranty: dto.defaultWarranty, coverNote: dto.coverNote,
        createdById: user.id,
      },
    });
    return ApiResponse.success(template, 'Template created');
  }

  @Get()
  @RequirePermissions('quotations:read')
  async list(@Query('industry') industry?: string, @Query('search') search?: string) {
    const result = await this.queryBus.execute(new GetTemplatesQuery(industry, search));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('quotations:update')
  async update(@Param('id') id: string, @Body() dto: any) {
    const template = await this.prisma.quotationTemplate.update({
      where: { id },
      data: {
        name: dto.name, description: dto.description, industry: dto.industry,
        defaultItems: dto.defaultItems, defaultTerms: dto.defaultTerms,
        defaultPayment: dto.defaultPayment, defaultDelivery: dto.defaultDelivery,
        defaultWarranty: dto.defaultWarranty, coverNote: dto.coverNote,
        isActive: dto.isActive,
      },
    });
    return ApiResponse.success(template, 'Template updated');
  }

  @Post(':id/create-quotation')
  @RequirePermissions('quotations:create')
  async createFromTemplate(@Param('id') templateId: string, @Body('leadId') leadId: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new CreateFromTemplateCommand(
      templateId, leadId, user.id, `${user.firstName} ${user.lastName}`,
    ));
    return ApiResponse.success(result, 'Quotation created from template');
  }
}
