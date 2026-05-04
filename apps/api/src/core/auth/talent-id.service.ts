import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TalentIdService {
  constructor(private prisma: PrismaService) {}

  async nextUserId(): Promise<string> {
    const latest = await this.prisma.identity.user.findFirst({
      where: { talentId: { not: null } },
      orderBy: { talentId: 'desc' },
      select: { talentId: true },
    });
    const num = latest?.talentId ? parseInt(latest.talentId.slice(1), 10) + 1 : 1;
    return `T${String(num).padStart(7, '0')}`;
  }

  async nextCompanyId(): Promise<string> {
    const latest = await (this.prisma.identity as any).company.findFirst({
      orderBy: { talentId: 'desc' },
      select: { talentId: true },
    });
    const num = latest?.talentId ? parseInt(latest.talentId.slice(1), 10) + 1 : 1;
    return `C${String(num).padStart(7, '0')}`;
  }
}
