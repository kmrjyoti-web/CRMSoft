import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProvisioningService } from './provisioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsString } from 'class-validator';

class DeprovisionDto {
  @IsString() confirmation: string;
}

@ApiTags('provisioning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('provisioning')
export class ProvisioningController {
  constructor(private provisioningService: ProvisioningService) {}

  @Post(':partnerId/provision')
  provision(@Param('partnerId') partnerId: string) {
    return this.provisioningService.provision(partnerId);
  }

  @Get(':partnerId/status')
  getStatus(@Param('partnerId') partnerId: string) {
    return this.provisioningService.getStatus(partnerId);
  }

  @Post(':partnerId/deprovision')
  deprovision(@Param('partnerId') partnerId: string, @Body() dto: DeprovisionDto) {
    return this.provisioningService.deprovision(partnerId, dto.confirmation);
  }

  @Post(':partnerId/reprovision')
  reprovision(@Param('partnerId') partnerId: string) {
    return this.provisioningService.reprovision(partnerId);
  }

  @Get(':partnerId/databases')
  getDatabases(@Param('partnerId') partnerId: string) {
    return this.provisioningService.getDatabases(partnerId);
  }
}
