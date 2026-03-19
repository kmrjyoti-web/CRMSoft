import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { LinkBrandOrganizationDto, LinkBrandContactDto } from './dto/link-brand.dto';

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  @RequirePermissions('brands:create')
  async create(@Body() dto: CreateBrandDto) {
    const brand = await this.prisma.working.brand.create({
      data: { ...dto, code: dto.code.toUpperCase() },
    });
    return ApiResponse.success(brand, 'Brand created');
  }

  @Get()
  @ApiOperation({ summary: 'List brands' })
  @RequirePermissions('brands:read')
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
      this.prisma.working.brand.findMany({ where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' } }),
      this.prisma.working.brand.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @RequirePermissions('brands:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const brand = await this.prisma.working.brand.findUniqueOrThrow({
      where: { id },
      include: {
        brandOrganizations: { include: { organization: { select: { id: true, name: true } } } },
        brandContacts: { include: { contact: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    return ApiResponse.success(brand);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  @RequirePermissions('brands:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const brand = await this.prisma.working.brand.update({ where: { id }, data });
    return ApiResponse.success(brand, 'Brand updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate brand' })
  @RequirePermissions('brands:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const brand = await this.prisma.working.brand.update({ where: { id }, data: { isActive: false } });
    return ApiResponse.success(brand, 'Brand deactivated');
  }

  @Post(':id/organizations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link brand to organization' })
  @RequirePermissions('brands:update')
  async linkOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkBrandOrganizationDto,
  ) {
    const existing = await this.prisma.working.brandOrganization.findFirst({
      where: { brandId: id, organizationId: dto.organizationId },
    });
    let link;
    if (existing) {
      link = await this.prisma.working.brandOrganization.update({
        where: { id: existing.id },
        data: { isPrimary: dto.isPrimary, notes: dto.notes },
      });
    } else {
      link = await this.prisma.working.brandOrganization.create({
        data: { brandId: id, ...dto },
      });
    }
    return ApiResponse.success(link, 'Organization linked');
  }

  @Delete(':id/organizations/:orgId')
  @ApiOperation({ summary: 'Unlink brand from organization' })
  @RequirePermissions('brands:update')
  async unlinkOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    await this.prisma.working.brandOrganization.deleteMany({
      where: { brandId: id, organizationId: orgId },
    });
    return ApiResponse.success(null, 'Organization unlinked');
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link brand to contact' })
  @RequirePermissions('brands:update')
  async linkContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkBrandContactDto,
  ) {
    const existing = await this.prisma.working.brandContact.findFirst({
      where: { brandId: id, contactId: dto.contactId },
    });
    let link;
    if (existing) {
      link = await this.prisma.working.brandContact.update({
        where: { id: existing.id },
        data: { role: dto.role, isPrimary: dto.isPrimary },
      });
    } else {
      link = await this.prisma.working.brandContact.create({
        data: { brandId: id, ...dto },
      });
    }
    return ApiResponse.success(link, 'Contact linked');
  }

  @Delete(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Unlink brand from contact' })
  @RequirePermissions('brands:update')
  async unlinkContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    await this.prisma.working.brandContact.deleteMany({
      where: { brandId: id, contactId },
    });
    return ApiResponse.success(null, 'Contact unlinked');
  }

  @Get(':id/organizations')
  @ApiOperation({ summary: 'Get brand organizations' })
  @RequirePermissions('brands:read')
  async getOrganizations(@Param('id', ParseUUIDPipe) id: string) {
    const orgs = await this.prisma.working.brandOrganization.findMany({
      where: { brandId: id },
      include: { organization: { select: { id: true, name: true, city: true } } },
    });
    return ApiResponse.success(orgs);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Get brand contacts' })
  @RequirePermissions('brands:read')
  async getContacts(@Param('id', ParseUUIDPipe) id: string) {
    const contacts = await this.prisma.working.brandContact.findMany({
      where: { brandId: id },
      include: { contact: { select: { id: true, firstName: true, lastName: true } } },
    });
    return ApiResponse.success(contacts);
  }
}
