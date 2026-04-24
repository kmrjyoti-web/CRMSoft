import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DomainType } from '@prisma/client';
import { IsString, IsEnum } from 'class-validator';

class AddDomainDto {
  @IsString() partnerId: string;
  @IsString() domain: string;
  @IsEnum(DomainType) domainType: DomainType;
}

@ApiTags('domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('domains')
export class DomainsController {
  constructor(private domainsService: DomainsService) {}

  @Post()
  add(@Body() dto: AddDomainDto) { return this.domainsService.add(dto); }

  @Get(':partnerId')
  listByPartner(@Param('partnerId') partnerId: string) { return this.domainsService.listByPartner(partnerId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.domainsService.remove(id); }

  @Post(':id/verify')
  verify(@Param('id') id: string) { return this.domainsService.verify(id); }

  @Get(':id/dns-records')
  getDnsRecords(@Param('id') id: string) { return this.domainsService.getDnsRecords(id); }
}
