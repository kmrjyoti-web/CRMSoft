import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import {
  LinkManufacturerOrganizationDto,
  LinkManufacturerContactDto,
} from './dto/link-manufacturer.dto';

@ApiTags('Manufacturers')
@ApiBearerAuth()
@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create manufacturer' })
  @RequirePermissions('manufacturers:create')
  async create(@Body() dto: CreateManufacturerDto) {
    const mfg = await this.prisma.manufacturer.create({
      data: { ...dto, code: dto.code.toUpperCase() },
    });
    return ApiResponse.success(mfg, 'Manufacturer created');
  }

  @Get()
  @ApiOperation({ summary: 'List manufacturers' })
  @RequirePermissions('manufacturers:read')
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
      this.prisma.manufacturer.findMany({
        where, skip: (p - 1) * l, take: l, orderBy: { name: 'asc' },
      }),
      this.prisma.manufacturer.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get manufacturer by ID' })
  @RequirePermissions('manufacturers:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const mfg = await this.prisma.manufacturer.findUniqueOrThrow({
      where: { id },
      include: {
        manufacturerOrganizations: {
          include: { organization: { select: { id: true, name: true } } },
        },
        manufacturerContacts: {
          include: { contact: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    return ApiResponse.success(mfg);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update manufacturer' })
  @RequirePermissions('manufacturers:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateManufacturerDto,
  ) {
    const data: any = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    const mfg = await this.prisma.manufacturer.update({ where: { id }, data });
    return ApiResponse.success(mfg, 'Manufacturer updated');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate manufacturer' })
  @RequirePermissions('manufacturers:delete')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const mfg = await this.prisma.manufacturer.update({
      where: { id }, data: { isActive: false },
    });
    return ApiResponse.success(mfg, 'Manufacturer deactivated');
  }

  @Post(':id/organizations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link manufacturer to organization' })
  @RequirePermissions('manufacturers:update')
  async linkOrg(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkManufacturerOrganizationDto,
  ) {
    const existing = await this.prisma.manufacturerOrganization.findFirst({
      where: { manufacturerId: id, organizationId: dto.organizationId },
    });
    let link;
    if (existing) {
      link = await this.prisma.manufacturerOrganization.update({
        where: { id: existing.id },
        data: { isPrimary: dto.isPrimary, notes: dto.notes },
      });
    } else {
      link = await this.prisma.manufacturerOrganization.create({
        data: { manufacturerId: id, ...dto },
      });
    }
    return ApiResponse.success(link, 'Organization linked');
  }

  @Delete(':id/organizations/:orgId')
  @ApiOperation({ summary: 'Unlink manufacturer from organization' })
  @RequirePermissions('manufacturers:update')
  async unlinkOrg(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    await this.prisma.manufacturerOrganization.deleteMany({
      where: { manufacturerId: id, organizationId: orgId },
    });
    return ApiResponse.success(null, 'Organization unlinked');
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link manufacturer to contact' })
  @RequirePermissions('manufacturers:update')
  async linkContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LinkManufacturerContactDto,
  ) {
    const existing = await this.prisma.manufacturerContact.findFirst({
      where: { manufacturerId: id, contactId: dto.contactId },
    });
    let link;
    if (existing) {
      link = await this.prisma.manufacturerContact.update({
        where: { id: existing.id },
        data: { role: dto.role, isPrimary: dto.isPrimary },
      });
    } else {
      link = await this.prisma.manufacturerContact.create({
        data: { manufacturerId: id, ...dto },
      });
    }
    return ApiResponse.success(link, 'Contact linked');
  }

  @Delete(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Unlink manufacturer from contact' })
  @RequirePermissions('manufacturers:update')
  async unlinkContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    await this.prisma.manufacturerContact.deleteMany({
      where: { manufacturerId: id, contactId },
    });
    return ApiResponse.success(null, 'Contact unlinked');
  }

  @Get(':id/organizations')
  @ApiOperation({ summary: 'Get manufacturer organizations' })
  @RequirePermissions('manufacturers:read')
  async getOrganizations(@Param('id', ParseUUIDPipe) id: string) {
    const orgs = await this.prisma.manufacturerOrganization.findMany({
      where: { manufacturerId: id },
      include: { organization: { select: { id: true, name: true, city: true } } },
    });
    return ApiResponse.success(orgs);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Get manufacturer contacts' })
  @RequirePermissions('manufacturers:read')
  async getContacts(@Param('id', ParseUUIDPipe) id: string) {
    const contacts = await this.prisma.manufacturerContact.findMany({
      where: { manufacturerId: id },
      include: { contact: { select: { id: true, firstName: true, lastName: true } } },
    });
    return ApiResponse.success(contacts);
  }
}
