import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Controller('platform-console/alerts')
export class AlertRulesController {
  private readonly logger = new Logger(AlertRulesController.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  @Get('rules')
  async listRules() {
    try {
      return await this.db.alertRule.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(
        `AlertRulesController.listRules failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Post('rules')
  async createRule(
    @Body()
    body: {
      name: string;
      severity: string;
      condition: Record<string, unknown>;
      channels: string[];
    },
  ) {
    try {
      return await this.db.alertRule.create({
        data: {
          name: body.name,
          severity: body.severity,
          condition: body.condition as any,
          channels: body.channels,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `AlertRulesController.createRule failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      severity: string;
      condition: Record<string, unknown>;
      channels: string[];
      isActive: boolean;
    }>,
  ) {
    try {
      return await this.db.alertRule.update({
        where: { id },
        data: body as any,
      });
    } catch (error) {
      this.logger.error(
        `AlertRulesController.updateRule failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    try {
      await this.db.alertRule.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      this.logger.error(
        `AlertRulesController.deleteRule failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get('history')
  async getHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const take = Math.min(parseInt(limit ?? '20'), 100);
      const skip = (parseInt(page ?? '1') - 1) * take;

      const [items, total] = await Promise.all([
        this.db.alertHistory.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.db.alertHistory.count(),
      ]);

      return { items, total, page: parseInt(page ?? '1'), limit: take };
    } catch (error) {
      this.logger.error(
        `AlertRulesController.getHistory failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
