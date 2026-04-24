import {
  Controller, Get, Post, Param, Query, Res, Body, UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ProcessTrackingEventCommand } from '../application/commands/process-tracking-event/process-tracking-event.command';

@ApiTags('Email Tracking')
@Controller('email-tracking')
export class EmailTrackingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('open/:emailId')
  async trackOpen(
    @Param('emailId') emailId: string,
    @Query('ip') ipAddress: string,
    @Query('ua') userAgent: string,
    @Res() res: Response,
  ) {
    try {
      await this.commandBus.execute(
        new ProcessTrackingEventCommand('OPEN', emailId, undefined, undefined, ipAddress, userAgent),
      );
    } catch {
      // Tracking should not fail silently
    }
    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(pixel);
  }

  @Get('click/:emailId')
  async trackClick(
    @Param('emailId') emailId: string,
    @Query('url') url: string,
    @Query('ip') ipAddress: string,
    @Query('ua') userAgent: string,
    @Res() res: Response,
  ) {
    try {
      await this.commandBus.execute(
        new ProcessTrackingEventCommand('CLICK', emailId, undefined, url, ipAddress, userAgent),
      );
    } catch {
      // Tracking should not fail
    }
    res.redirect(decodeURIComponent(url));
  }

  @Post('bounce')
  async trackBounce(
    @Body('emailId') emailId: string,
    @Body('reason') reason: string,
  ) {
    await this.commandBus.execute(
      new ProcessTrackingEventCommand('BOUNCE', emailId, undefined, undefined, undefined, undefined, reason),
    );
    return { success: true };
  }
}
