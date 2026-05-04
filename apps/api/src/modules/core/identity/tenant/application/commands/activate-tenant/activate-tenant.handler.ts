import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ActivateTenantCommand } from './activate-tenant.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(ActivateTenantCommand)
export class ActivateTenantHandler implements ICommandHandler<ActivateTenantCommand> {
  private readonly logger = new Logger(ActivateTenantHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ActivateTenantCommand) {
    try {
      const tenant = await this.prisma.identity.tenant.update({
        where: { id: command.tenantId },
        data: { status: 'ACTIVE' },
      });

      this.logger.log(`Tenant activated: ${tenant.id}`);
      return tenant;
    } catch (error) {
      this.logger.error(`ActivateTenantHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
