import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ScalingService } from './scaling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

class UpdatePolicyDto {
  @IsOptional() @IsInt() @Min(1) @Max(10) maxInstances?: number;
  @IsOptional() @IsInt() @Min(1) minInstances?: number;
  @IsOptional() @IsInt() @Min(50) @Max(95) scaleUpThreshold?: number;
  @IsOptional() @IsInt() @Min(5) @Max(50) scaleDownThreshold?: number;
  @IsOptional() @IsBoolean() isAutoScalingEnabled?: boolean;
  @IsOptional() @IsInt() @Min(5) @Max(120) cooldownMinutes?: number;
}

@ApiTags('scaling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('scaling')
export class ScalingController {
  constructor(private scalingService: ScalingService) {}

  @Get('dashboard')
  getDashboard() {
    return this.scalingService.getScalingDashboard();
  }

  @Get('policies/:partnerId')
  getPolicy(@Param('partnerId') partnerId: string) {
    return this.scalingService.getOrCreatePolicy(partnerId);
  }

  @Put('policies/:partnerId')
  updatePolicy(@Param('partnerId') partnerId: string, @Body() dto: UpdatePolicyDto) {
    return this.scalingService.updatePolicy(partnerId, dto);
  }

  @Get('events/:partnerId')
  getHistory(@Param('partnerId') partnerId: string, @Query('limit') limit = '20') {
    return this.scalingService.getScalingHistory(partnerId, +limit);
  }

  @Post('evaluate/:partnerId')
  evaluatePartner(@Param('partnerId') partnerId: string) {
    return this.scalingService.evaluatePartner(partnerId);
  }

  @Post('evaluate-all')
  evaluateAll() {
    return this.scalingService.evaluateAll().then(() => ({ triggered: true }));
  }
}
