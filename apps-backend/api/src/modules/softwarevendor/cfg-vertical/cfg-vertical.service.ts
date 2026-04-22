import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class CfgVerticalService {
  private readonly logger = new Logger(CfgVerticalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    try {
      return await this.prisma.platform.gvCfgVertical.findMany({
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to list verticals', error);
      throw error;
    }
  }

  async findActive() {
    try {
      return await this.prisma.platform.gvCfgVertical.findMany({
        where: { isActive: true },
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to list active verticals', error);
      throw error;
    }
  }

  async findBuilt() {
    try {
      return await this.prisma.platform.gvCfgVertical.findMany({
        where: { isBuilt: true },
        include: { modules: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to list built verticals', error);
      throw error;
    }
  }

  async findByCode(code: string) {
    try {
      const vertical = await this.prisma.platform.gvCfgVertical.findUnique({
        where: { code },
        include: { modules: true },
      });
      if (!vertical) {
        throw new NotFoundException(`Vertical with code '${code}' not found`);
      }
      return vertical;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find vertical by code: ${code}`, error);
      throw error;
    }
  }
}
