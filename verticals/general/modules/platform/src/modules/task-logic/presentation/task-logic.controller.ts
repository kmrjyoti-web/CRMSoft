import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TaskLogicService } from '../task-logic.service';
import { UpsertTaskLogicConfigDto } from './dto/upsert-task-logic-config.dto';

@Controller('task-logic-configs')
export class TaskLogicController {
  constructor(private readonly taskLogicService: TaskLogicService) {}

  @Get()
  @RequirePermissions('settings:read')
  async getAll() {
    const result = await this.taskLogicService.getAllConfigs();
    return ApiResponse.success(result);
  }

  @Get(':key')
  @RequirePermissions('settings:read')
  async getByKey(@Param('key') key: string) {
    const result = await this.taskLogicService.getConfig(key);
    return ApiResponse.success(result);
  }

  @Put(':key')
  @RequirePermissions('settings:update')
  async upsert(@Param('key') key: string, @Body() dto: UpsertTaskLogicConfigDto) {
    const result = await this.taskLogicService.upsertConfig(key, dto.value, dto.description);
    return ApiResponse.success(result, 'Config saved');
  }

  @Delete(':key')
  @RequirePermissions('settings:update')
  async remove(@Param('key') key: string) {
    const result = await this.taskLogicService.deleteConfig(key);
    return ApiResponse.success(result, 'Config deactivated');
  }
}
