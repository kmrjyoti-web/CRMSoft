import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { EmailFooterTemplate } from '@prisma/working-client';
import { AppError } from '../../../../../common/errors/app-error';

@Injectable()
export class EmailFooterService {
  private readonly logger = new Logger(EmailFooterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** List all footer templates for a tenant. */
  async list(tenantId: string): Promise<EmailFooterTemplate[]> {
    return this.prisma.emailFooterTemplate.findMany({
      where: { tenantId, isActive: true },
      orderBy: { isDefault: 'desc' },
    });
  }

  /** Create a footer template. */
  async create(tenantId: string, data: { name: string; bodyHtml: string; isDefault?: boolean }): Promise<EmailFooterTemplate> {
    if (data.isDefault) {
      await this.prisma.emailFooterTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.emailFooterTemplate.create({
      data: { tenantId, ...data },
    });
  }

  /** Update a footer template. */
  async update(tenantId: string, id: string, data: Partial<EmailFooterTemplate>): Promise<EmailFooterTemplate> {
    const footer = await this.prisma.emailFooterTemplate.findFirst({ where: { id, tenantId } });
    if (!footer) throw AppError.from('NOT_FOUND');
    if (data.isDefault) {
      await this.prisma.emailFooterTemplate.updateMany({
        where: { tenantId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.emailFooterTemplate.update({ where: { id }, data });
  }

  /** Get the default footer for a tenant. */
  async getDefault(tenantId: string): Promise<EmailFooterTemplate | null> {
    return this.prisma.emailFooterTemplate.findFirst({
      where: { tenantId, isDefault: true, isActive: true },
    });
  }
}
