import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ErrorsService } from './errors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ErrorSeverity } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

class CollectErrorsDto {
  @IsArray() errors: any[];
}

class ResolveDto {
  @IsString() resolution: string;
}

@ApiTags('errors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('errors')
export class ErrorsController {
  constructor(private errorsService: ErrorsService) {}

  @Post(':partnerId/collect')
  collect(@Param('partnerId') partnerId: string, @Body() dto: CollectErrorsDto) {
    return this.errorsService.collectErrors(partnerId, dto.errors);
  }

  @Get('dashboard')
  dashboard(@Query('partnerId') partnerId?: string) {
    return this.errorsService.getErrorDashboard(partnerId);
  }

  @Get(':partnerId')
  getPartnerErrors(
    @Param('partnerId') partnerId: string,
    @Query('severity') severity?: ErrorSeverity,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.errorsService.getPartnerErrors(partnerId, { severity, page: +page, limit: +limit });
  }

  @Patch(':errorId/resolve')
  resolve(@Param('errorId') errorId: string, @Body() dto: ResolveDto) {
    return this.errorsService.resolveError(errorId, dto.resolution);
  }
}
