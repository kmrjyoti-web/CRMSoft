import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { EscalationService } from './escalation.service';

@Controller('platform-console/errors')
export class DeveloperErrorController {
  private readonly logger = new Logger(DeveloperErrorController.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly escalationService: EscalationService,
  ) {}

  @Get('escalated')
  async getEscalated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const take = Math.min(parseInt(limit ?? '20'), 100);
      const skip = (parseInt(page ?? '1') - 1) * take;

      const [items, total] = await Promise.all([
        this.db.customerErrorReport.findMany({
          where: { status: 'ESCALATED' },
          orderBy: { escalatedAt: 'desc' },
          skip,
          take,
        }),
        this.db.customerErrorReport.count({ where: { status: 'ESCALATED' } }),
      ]);

      return { items, total, page: parseInt(page ?? '1'), limit: take };
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.getEscalated failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get('auto-reports')
  async getAutoReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('acknowledged') acknowledged?: string,
  ) {
    try {
      const take = Math.min(parseInt(limit ?? '20'), 100);
      const skip = (parseInt(page ?? '1') - 1) * take;
      const where: any = {};
      if (acknowledged !== undefined) {
        where.acknowledged = acknowledged === 'true';
      }

      const [items, total] = await Promise.all([
        this.db.errorAutoReport.findMany({
          where,
          orderBy: { notifiedAt: 'desc' },
          skip,
          take,
        }),
        this.db.errorAutoReport.count({ where }),
      ]);

      return { items, total, page: parseInt(page ?? '1'), limit: take };
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.getAutoReports failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get('by-brand')
  async getByBrand() {
    try {
      return await this.db.customerErrorReport.groupBy({
        by: ['brandId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      });
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.getByBrand failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get('by-vertical')
  async getByVertical() {
    try {
      return await this.db.globalErrorLog.groupBy({
        by: ['verticalType'],
        _count: { id: true },
        where: { verticalType: { not: null } },
        orderBy: { _count: { id: 'desc' } },
      });
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.getByVertical failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id/resolve')
  async resolveError(
    @Param('id') id: string,
    @Body() body: { resolution: string; resolvedBy: string },
  ) {
    try {
      await this.escalationService.resolveError(id, body.resolution, body.resolvedBy);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.resolveError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Post(':id/notes')
  async addDeveloperNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
  ) {
    try {
      // Update escalation record developerNotes
      const escalation = await this.db.errorEscalation.findFirst({
        where: { errorLogId: id },
      });

      if (escalation) {
        return await this.db.errorEscalation.update({
          where: { id: escalation.id },
          data: { developerNotes: notes },
        });
      }

      // Create escalation record if none exists
      return await this.db.errorEscalation.create({
        data: {
          errorLogId: id,
          level: 3,
          developerNotes: notes,
        },
      });
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.addDeveloperNotes failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id/assign')
  async assignError(
    @Param('id') id: string,
    @Body() body: { gitIssue?: string; assignedTo?: string },
  ) {
    try {
      return await this.db.globalErrorLog.update({
        where: { id },
        data: {
          resolution: body.gitIssue
            ? `Assigned to ${body.gitIssue}`
            : body.assignedTo,
        },
      });
    } catch (error) {
      this.logger.error(
        `DeveloperErrorController.assignError failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
