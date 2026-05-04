import { Controller, Get, Put, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationPrefService } from '../services/notification-pref.service';
import { UpdateNotifPrefDto, BulkUpdateNotifPrefDto } from './dto/update-notif-pref.dto';

@ApiTags('Settings - Notification Preferences')
@Controller('settings/notifications')
export class NotificationPrefController {
  constructor(private readonly service: NotificationPrefService) {}

