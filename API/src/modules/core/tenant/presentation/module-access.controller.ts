import {
  Controller, Get, Post, Put, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuperAdminGuard } from '../infrastructure/super-admin.guard';
import { SuperAdminRoute } from '../infrastructure/decorators/super-admin-route.decorator';
import { ModuleDefinitionService } from '../services/module-definition.service';
import { ModuleAccessService } from '../services/module-access.service';
import { UpsertModuleAccessDto } from './dto/upsert-module-access.dto';
import { ApiResponse } from '../../../../common/utils/api-response';

@ApiTags('Module Access')
@ApiBearerAuth()
@SuperAdminRoute()
@UseGuards(SuperAdminGuard)
@Controller('admin/module-access')
export class ModuleAccessController {
  constructor(
    private readonly moduleDefinitionService: ModuleDefinitionService,
    private readonly moduleAccessService: ModuleAccessService,
  ) {}

  @Get('modules')
  @ApiOperation({ summary: 'List all module definitions' })
  async listModules(@Query() query: any) {
    const data = await this.moduleDefinitionService.listAll(query);
    return ApiResponse.success(data);
  }

  @Post('modules/seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed module definitions from default data' })
  async seedModules() {
    const data = await this.moduleDefinitionService.seed();
    return ApiResponse.success(data, 'Module definitions seeded');
  }

  @Get('plans/:planId/module-access')
  @ApiOperation({ summary: 'Get module access entries for a plan' })
  async getByPlan(@Param('planId') planId: string) {
    const data = await this.moduleAccessService.getByPlan(planId);
    return ApiResponse.success(data);
  }

  @Put('plans/:planId/module-access')
  @ApiOperation({ summary: 'Upsert module access for a plan' })
  async upsertAccess(
    @Param('planId') planId: string,
    @Body() body: UpsertModuleAccessDto,
  ) {
    const data = await this.moduleAccessService.upsertAccess(planId, body.modules);
    return ApiResponse.success(data, 'Module access updated');
  }

  @Get('modules/access-matrix')
  @ApiOperation({ summary: 'Get full module access matrix across all plans' })
  async getAccessMatrix() {
    const data = await this.moduleAccessService.getAccessMatrix();
    return ApiResponse.success(data);
  }
}
