import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsString } from 'class-validator';

class TriggerTestDto {
  @IsString() testType: string;
}

@ApiTags('tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('tests')
export class TestsController {
  constructor(private testsService: TestsService) {}

  @Post(':partnerId/collect')
  collect(@Param('partnerId') partnerId: string, @Body() dto: any) {
    return this.testsService.collectTestResults(partnerId, dto);
  }

  @Post(':partnerId/trigger')
  trigger(@Param('partnerId') partnerId: string, @Body() dto: TriggerTestDto) {
    return this.testsService.triggerPartnerTest(partnerId, dto.testType);
  }

  @Get('dashboard')
  dashboard(@Query('partnerId') partnerId?: string) {
    return this.testsService.getTestDashboard(partnerId);
  }

  @Get(':partnerId')
  getPartnerTests(
    @Param('partnerId') partnerId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.testsService.getPartnerTests(partnerId, +page, +limit);
  }
}
