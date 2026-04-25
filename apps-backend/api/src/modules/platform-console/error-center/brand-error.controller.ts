import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';
import { ERROR_CENTER_ERRORS } from './error-center.errors';
import { Public } from '../../../common/decorators/roles.decorator';

@Public()
@Controller('errors/brand')
export class BrandErrorController {
  private readonly logger = new Logger(BrandErrorController.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly escalationService: EscalationService,
  ) {}

  @Get(':brandId')
  async getBrandErrors(
    @Param('brandId') brandId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    try {
      const take = Math.min(parseInt(limit ?? '20'), 100);
      const skip = (parseInt(page ?? '1') - 1) * take;
      const where: any = { brandId };
      if (status) where.status = status;

      const [items, total] = await Promise.all([
        this.db.customerErrorReport.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
          select: {
            id: true,
            reportedBy: true,
            title: true,
            errorCode: true,
            status: true,
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
        `BrandErrorController.getBrandErrors failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':brandId/stats')
  async getBrandStats(@Param('brandId') brandId: string) {
    try {
      const [total, byStatus, recent] = await Promise.all([
        this.db.customerErrorReport.count({ where: { brandId } }),
        this.db.customerErrorReport.groupBy({
          by: ['status'],
          _count: { id: true },
          where: { brandId },
        }),
        this.db.customerErrorReport.findMany({
          where: { brandId, status: { not: 'RESOLVED' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, title: true, status: true, createdAt: true },
        }),
      ]);

      return { total, byStatus, recent };
    } catch (error) {
      this.logger.error(
        `BrandErrorController.getBrandStats failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':brandId/:id')
  async getBrandError(
    @Param('brandId') brandId: string,
    @Param('id') id: string,
  ) {
    try {
      const report = await this.db.customerErrorReport.findFirst({
        where: { id, brandId },
        select: {
          id: true,
          reportedBy: true,
          title: true,
          description: true,
          errorCode: true,
          screenshots: true,
          browserInfo: true,
          lastActions: true,
          status: true,
          escalatedAt: true,
          resolvedAt: true,
          createdAt: true,
          // Omit developerNotes (not in schema on CustomerErrorReport — in ErrorEscalation)
        },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      return report;
    } catch (error) {
      this.logger.error(
        `BrandErrorController.getBrandError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':brandId/:id/ack')
  async acknowledgeError(
    @Param('brandId') brandId: string,
    @Param('id') id: string,
  ) {
    try {
      const report = await this.db.customerErrorReport.findFirst({
        where: { id, brandId },
      });
      if (!report) {
        throw new NotFoundException(ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
      }
      return await this.db.customerErrorReport.update({
        where: { id },
        data: { status: 'ACKNOWLEDGED' },
      });
    } catch (error) {
      this.logger.error(
        `BrandErrorController.acknowledgeError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Post(':brandId/:id/escalate')
  async escalateToDeveloper(
    @Param('brandId') brandId: string,
    @Param('id') id: string,
    @Body('brandNotes') brandNotes: string,
  ) {
    try {
      await this.escalationService.escalateToDeveloper(id, brandNotes ?? '');
      return { success: true };
    } catch (error) {
      this.logger.error(
        `BrandErrorController.escalateToDeveloper failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Post(':brandId/:id/resolve')
  async resolveError(
    @Param('brandId') brandId: string,
    @Param('id') id: string,
    @Body() body: { resolution: string; resolvedBy: string },
  ) {
    try {
      await this.escalationService.resolveError(id, body.resolution, body.resolvedBy);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `BrandErrorController.resolveError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
