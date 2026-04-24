import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { EscalationService } from './escalation.service';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { ERROR_CENTER_ERRORS } from './error-center.errors';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('errors/report')
export class ErrorReportController {
  private readonly logger = new Logger(ErrorReportController.name);

  constructor(
    private readonly escalationService: EscalationService,
    private readonly db: PlatformConsolePrismaService,
  ) {}

  @Post()
  async submitReport(
    @Body()
    body: {
      brandId: string;
      tenantId?: string;
      reportedBy: string;
      title: string;
      description: string;
      errorCode?: string;
      screenshots?: string[];
      browserInfo?: Record<string, unknown>;
      lastActions?: string[];
    },
    @Headers('user-agent') userAgent?: string,
  ) {
    try {
      const browserInfo = {
        ...(body.browserInfo ?? {}),
        userAgent: userAgent ?? 'unknown',
      };
      return await this.escalationService.submitCustomerReport({
        ...body,
        browserInfo,
      });
    } catch (error) {
      this.logger.error(
        `ErrorReportController.submitReport failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get('my')
  async getMyReports(
    @Query('reportedBy') reportedBy: string,
    @Query('brandId') brandId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    try {
      const take = Math.min(parseInt(limit ?? '20'), 100);
      const skip = (parseInt(page ?? '1') - 1) * take;

      const where: any = { reportedBy, brandId };
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        this.db.customerErrorReport.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
          select: {
            id: true,
            title: true,
            status: true,
            errorCode: true,
            createdAt: true,
            resolvedAt: true,
            escalatedAt: true,
          },
        }),
        this.db.customerErrorReport.count({ where }),
      ]);

      return { items, total, page: parseInt(page ?? '1'), limit: take };
    } catch (error) {
      this.logger.error(
        `ErrorReportController.getMyReports failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':id')
  async getReport(@Param('id') id: string) {
    try {
      const report = await this.db.customerErrorReport.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          errorCode: true,
          screenshots: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          escalatedAt: true,
          // Exclude: internal developer/brand notes
        },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      return report;
    } catch (error) {
      this.logger.error(
        `ErrorReportController.getReport failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
