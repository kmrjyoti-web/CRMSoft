import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeploymentsService } from './deployments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsString, IsOptional } from 'class-validator';

class DeployDto {
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsString() gitTag?: string;
}

class RollbackDto {
  @IsString() targetVersion: string;
}

@ApiTags('deployments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('deployments')
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post(':partnerId/deploy')
  deploy(@Param('partnerId') partnerId: string, @Body() dto: DeployDto) {
    return this.deploymentsService.deploy(partnerId, dto);
  }

  @Post(':partnerId/rollback')
  rollback(@Param('partnerId') partnerId: string, @Body() dto: RollbackDto) {
    return this.deploymentsService.rollback(partnerId, dto.targetVersion);
  }

  @Get(':partnerId')
  getDeployment(@Param('partnerId') partnerId: string) {
    return this.deploymentsService.getDeployment(partnerId);
  }

  @Get(':partnerId/health')
  checkHealth(@Param('partnerId') partnerId: string) {
    return this.deploymentsService.checkHealth(partnerId);
  }

  @Get(':partnerId/history')
  getHistory(@Param('partnerId') partnerId: string) {
    return this.deploymentsService.getHistory(partnerId);
  }

  @Post('health-check-all')
  checkAllHealth() {
    return this.deploymentsService.checkAllHealth();
  }
}
