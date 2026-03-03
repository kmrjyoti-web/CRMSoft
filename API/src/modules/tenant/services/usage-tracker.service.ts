import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger(UsageTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recalculate(tenantId: string) {
    // Use explicit where tenantId to bypass middleware (we want precise counts)
    const [usersCount, contactsCount, leadsCount, productsCount] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.contact.count({ where: { tenantId } }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.product.count({ where: { tenantId } }),
    ]);

    await this.prisma.tenantUsage.upsert({
      where: { tenantId },
      update: {
        usersCount,
        contactsCount,
        leadsCount,
        productsCount,
        lastCalculated: new Date(),
      },
      create: {
        tenantId,
        usersCount,
        contactsCount,
        leadsCount,
        productsCount,
        lastCalculated: new Date(),
      },
    });

    this.logger.log(`Usage recalculated for tenant ${tenantId}: users=${usersCount}, contacts=${contactsCount}, leads=${leadsCount}, products=${productsCount}`);
  }
}
