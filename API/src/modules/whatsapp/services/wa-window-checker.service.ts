import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class WaWindowCheckerService {
  constructor(private readonly prisma: PrismaService) {}

  isWindowOpen(windowExpiresAt: Date | null): boolean {
    if (!windowExpiresAt) return false;
    return new Date() < windowExpiresAt;
  }

  getWindowExpiry(windowExpiresAt: Date | null): number {
    if (!windowExpiresAt) return 0;
    const remaining = windowExpiresAt.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  async refreshWindow(conversationId: string): Promise<Date> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.waConversation.update({
      where: { id: conversationId },
      data: { windowExpiresAt: expiresAt, isWindowOpen: true },
    });
    return expiresAt;
  }

  async closeExpiredWindows(): Promise<number> {
    const result = await this.prisma.waConversation.updateMany({
      where: { isWindowOpen: true, windowExpiresAt: { lt: new Date() } },
      data: { isWindowOpen: false },
    });
    return result.count;
  }
}
