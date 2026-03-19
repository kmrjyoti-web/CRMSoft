import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CalendarConfigService } from '../services/calendar-config.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Controller('calendar/admin')
export class CalendarAdminController {
  constructor(
    private readonly configService: CalendarConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Config Endpoints ─────────────────────────────────────────

  /**
   * List all calendar configs for the tenant.
   */
  @Get('config')
  @RequirePermissions('calendar:admin')
  async getAllConfigs(@CurrentUser('tenantId') tenantId: string) {
    const configs = await this.configService.getAllConfigs(tenantId);
    return ApiResponse.success(configs);
  }

  /**
   * Get a single config by key.
   */
  @Get('config/:key')
  @RequirePermissions('calendar:admin')
  async getConfig(
    @CurrentUser('tenantId') tenantId: string,
    @Param('key') key: string,
  ) {
    const value = await this.configService.getConfig(tenantId, key);
    return ApiResponse.success(value);
  }

  /**
   * Upsert a config key.
   */
  @Put('config/:key')
  @RequirePermissions('calendar:admin')
  async upsertConfig(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() body: { value: any; description?: string },
  ) {
    const result = await this.configService.upsertConfig(
      tenantId,
      key,
      body.value,
      body.description,
      userId,
    );
    return ApiResponse.success(result, 'Config updated');
  }

  /**
   * Reset all configs to system defaults.
   */
  @Post('config/reset')
  @RequirePermissions('calendar:admin')
  @HttpCode(HttpStatus.OK)
  async resetToDefaults(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.configService.resetToDefaults(tenantId, userId);
    return ApiResponse.success(null, 'Calendar configs reset to defaults');
  }

  // ─── Holiday Endpoints ────────────────────────────────────────

  /**
   * Get all holidays for the tenant.
   */
  @Get('holidays')
  @RequirePermissions('calendar:admin')
  async getHolidays(@CurrentUser('tenantId') tenantId: string) {
    const holidays = await this.prisma.holidayCalendar.findMany({
      where: { tenantId, isActive: true },
      orderBy: { date: 'asc' },
    });
    return ApiResponse.success(holidays);
  }

  /**
   * Create a new holiday entry.
   */
  @Post('holidays')
  @RequirePermissions('calendar:admin')
  @HttpCode(HttpStatus.CREATED)
  async createHoliday(
    @CurrentUser('tenantId') tenantId: string,
    @Body()
    body: {
      name: string;
      date: string;
      type?: string;
      isRecurring?: boolean;
      applicableStates?: string[];
      isHalfDay?: boolean;
      halfDayEnd?: string;
      description?: string;
    },
  ) {
    const holiday = await this.prisma.holidayCalendar.create({
      data: {
        tenantId,
        name: body.name,
        date: new Date(body.date),
        type: (body.type as any) || 'COMPANY',
        isRecurring: body.isRecurring ?? false,
        applicableStates: body.applicableStates ?? [],
        isHalfDay: body.isHalfDay ?? false,
        halfDayEnd: body.halfDayEnd,
        description: body.description,
      },
    });
    return ApiResponse.success(holiday, 'Holiday created');
  }

  /**
   * Delete a holiday by ID (soft delete).
   */
  @Delete('holidays/:id')
  @RequirePermissions('calendar:admin')
  @HttpCode(HttpStatus.OK)
  async deleteHoliday(@Param('id') id: string) {
    await this.prisma.holidayCalendar.update({
      where: { id },
      data: { isActive: false },
    });
    return ApiResponse.success(null, 'Holiday deleted');
  }
}
