import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/utils/api-response';
import { InventoryLabelService } from '../services/label.service';
import { UpsertLabelDto } from './dto/inventory.dto';

@ApiTags('Vendor - Inventory Labels')
@ApiBearerAuth()
@Controller('vendor/inventory-labels')
export class InventoryLabelsController {
  constructor(private readonly labelService: InventoryLabelService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory labels per industry' })
  async list() {
    const data = await this.labelService.list();
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: 'Create/update inventory labels for industry' })
  async upsert(@Body() dto: UpsertLabelDto) {
    const data = await this.labelService.upsert(dto);
    return ApiResponse.success(data, 'Label saved');
  }
}
