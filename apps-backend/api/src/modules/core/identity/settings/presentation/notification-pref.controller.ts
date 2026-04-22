import { Controller, Get, Put, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationPrefService } from '../services/notification-pref.service';
import { UpdateNotifPrefDto, BulkUpdateNotifPrefDto } from './dto/update-notif-pref.dto';

@ApiTags('Settings - Notification Preferences')
@Controller('settings/notifications')
export class NotificationPrefController {
  constructor(private readonly service: NotificationPrefService) {}

  /** Get all event × channel matrix (grouped by category). */
  @Get()
  getAll(@Req() req: any) {
    return this.service.getAllGrouped(req.user.tenantId);
  }

  /** Update single event's channels. */
  @Put(':eventCode')
  update(@Req() req: any, @Param('eventCode') eventCode: string, @Body() dto: UpdateNotifPrefDto) {
    return this.service.update(req.user.tenantId, eventCode, dto);
  }

  /** Bulk update multiple events. */
  @Put('bulk')
  bulkUpdate(@Req() req: any, @Body() dto: BulkUpdateNotifPrefDto) {
    const updates = dto.updates.map((u) => ({
      eventCode: u.eventCode,
      changes: u,
    }));
    return this.service.bulkUpdate(req.user.tenantId, updates);
  }

  /** Send test notification for an event. */
  @Post('test/:eventCode')
  sendTest(@Req() req: any, @Param('eventCode') eventCode: string) {
    return this.service.sendTest(req.user.tenantId, eventCode);
  }
}
