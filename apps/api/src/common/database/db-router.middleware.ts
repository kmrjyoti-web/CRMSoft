import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaClientFactory } from './prisma-client-factory.service';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class DbRouterMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DbRouterMiddleware.name);

  constructor(
    private readonly factory: PrismaClientFactory,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenant = (req as any)['tenant'];

    if (!tenant?.id) {
      // No tenant resolved — attach shared client so services can still use req['tenantPrisma']
      (req as any)['tenantPrisma'] = this.prisma.working;
      return next();
    }

    try {
      const client = await this.factory.getClient(tenant.id);
      (req as any)['tenantPrisma'] = client;
    } catch (err: any) {
      this.logger.warn(`DbRouter failed for tenant ${tenant.id}: ${err.message} — using shared DB`);
      (req as any)['tenantPrisma'] = this.prisma.working;
    }

    next();
  }
}
