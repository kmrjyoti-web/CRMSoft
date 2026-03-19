import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SlaMonitorService {
  private readonly logger = new Logger(SlaMonitorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (CHECK_SLA_BREACHES). */
  async checkSlaBreaches(): Promise<void> {
    try {
      const instances = await this.prisma.working.workflowInstance.findMany({
        where: { isActive: true },
        include: { currentState: true },
      });

      for (const instance of instances) {
        await this.processInstance(instance).catch((err) => {
          this.logger.error(`SLA check failed for instance ${instance.id}: ${err.message}`);
        });
      }
    } catch (error: any) {
      this.logger.error(`SLA monitor run failed: ${error.message}`);
    }
  }

  private async processInstance(instance: any): Promise<void> {
    const metadata = instance.currentState.metadata as any;
    if (!metadata?.slaHours || !metadata?.escalationEnabled) return;

    const slaHours = Number(metadata.slaHours);
    const hoursInState = (Date.now() - new Date(instance.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursInState <= slaHours) return;

    const escalationLevel = Math.min(Math.floor(hoursInState / slaHours), 3);

    const existingEscalation = await this.prisma.working.workflowSlaEscalation.findFirst({
      where: {
        instanceId: instance.id,
        stateId: instance.currentStateId,
        escalationLevel,
        isResolved: false,
      },
    });

    if (existingEscalation) return;

    const escalatedToId = await this.findEscalationTarget(escalationLevel);

    await this.prisma.working.workflowSlaEscalation.create({
      data: {
        instanceId: instance.id,
        stateId: instance.currentStateId,
        slaHours,
        escalatedToId,
        escalationLevel,
      },
    });

    this.logger.warn(
      `SLA breach: Instance ${instance.id} in state "${instance.currentState.code}" ` +
      `for ${hoursInState.toFixed(1)}h (SLA: ${slaHours}h). Level ${escalationLevel} escalation.`,
    );
  }

  private async findEscalationTarget(level: number): Promise<string | null> {
    const roleMap: Record<number, string> = {
      1: 'MANAGER',
      2: 'ADMIN',
      3: 'SUPER_ADMIN',
    };
    const roleName = roleMap[level] || 'SUPER_ADMIN';

    const user = await this.prisma.user.findFirst({
      where: { role: { name: roleName }, status: 'ACTIVE' },
      select: { id: true },
    });

    return user?.id || null;
  }

  async resolveEscalations(instanceId: string, stateId: string): Promise<void> {
    await this.prisma.working.workflowSlaEscalation.updateMany({
      where: { instanceId, stateId, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}
