import { Controller, Post, Body, Req, HttpCode, UseGuards } from '@nestjs/common';
import { ErrorLoggerService } from '../error-logger.service';
import { Public } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { randomUUID } from 'crypto';

/**
 * Public endpoint for frontend and mobile error logging.
 * These endpoints do NOT require authentication.
 */
@Controller('errors')
export class FrontendErrorController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  /**
   * POST /errors/frontend
   * Log frontend errors (can be unauthenticated).
   */
  @Post('frontend')
  @Public()
  @HttpCode(200)
  logFrontendError(
    @Req() req: any,
    @Body() body: {
      errorCode: string;
      message: string;
      stack?: string;
      url?: string;
      component?: string;
      userAction?: string;
      metadata?: any;
    },
  ) {
    const traceId = randomUUID();
    const tenantId = req.tenantId || req.user?.tenantId || null;
    const userId = req.user?.id || null;

    this.errorLoggerService.log({
      requestId: traceId,
      errorCode: body.errorCode || 'FE_UNKNOWN',
      message: body.message,
      statusCode: 0,
      path: body.url || '/',
      method: 'FRONTEND',
      layer: 'FE',
      severity: 'ERROR',
      userId,
      tenantId,
      userAgent: req.headers?.['user-agent'],
      ip: req.ip || req.headers?.['x-forwarded-for']?.toString(),
      module: body.component || 'frontend',
      metadata: {
        url: body.url,
        component: body.component,
        userAction: body.userAction,
        ...body.metadata,
      },
    });

    return { traceId, success: true };
  }

  /**
   * POST /errors/mobile
   * Log mobile app errors (requires authentication).
   */
  @Post('mobile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logMobileError(
    @Req() req: any,
    @Body() body: {
      errorCode: string;
      message: string;
      stack?: string;
      screen?: string;
      action?: string;
      deviceInfo?: any;
      metadata?: any;
    },
  ) {
    const traceId = randomUUID();

    this.errorLoggerService.log({
      requestId: traceId,
      errorCode: body.errorCode || 'MOB_UNKNOWN',
      message: body.message,
      statusCode: 0,
      path: body.screen || '/',
      method: 'MOBILE',
      layer: 'MOB',
      severity: 'ERROR',
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      userAgent: req.headers?.['user-agent'],
      ip: req.ip,
      module: body.screen || 'mobile',
      metadata: {
        screen: body.screen,
        action: body.action,
        deviceInfo: body.deviceInfo,
        ...body.metadata,
      },
    });

    return { traceId, success: true };
  }
}
