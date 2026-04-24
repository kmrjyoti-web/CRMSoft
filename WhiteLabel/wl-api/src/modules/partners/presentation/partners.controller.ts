import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { PartnersService } from '../partners.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuditService } from '../../audit/audit.service';
import { PartnerPlan } from '@prisma/client';

class CreatePartnerDto {
  @IsString() companyName: string;
  @IsString() contactName: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsEnum(PartnerPlan) plan?: PartnerPlan;
  @IsOptional() @IsString() partnerCode?: string;
}

class UpdatePartnerDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(PartnerPlan) plan?: PartnerPlan;
}

class SuspendDto {
  @IsString() reason: string;
}

@ApiTags('partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('partners')
export class PartnersController {
  constructor(private partnersService: PartnersService, private auditService: AuditService) {}

  @Post()
  async create(@Body() dto: CreatePartnerDto, @Request() req: any) {
    const partner = await this.partnersService.create(dto);
    await this.auditService.log({ partnerId: partner.id, action: 'PARTNER_CREATED', performedBy: req.user.email, performedByRole: 'MASTER_ADMIN', details: { companyName: dto.companyName } });
    return partner;
  }

  @Get('dashboard')
  getDashboard() { return this.partnersService.getDashboard(); }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20', @Query('search') search?: string) {
    return this.partnersService.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.partnersService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) { return this.partnersService.update(id, dto); }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Body() dto: SuspendDto) { return this.partnersService.suspend(id, dto.reason); }

  @Post(':id/activate')
  activate(@Param('id') id: string) { return this.partnersService.activate(id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.partnersService.remove(id); }
}
