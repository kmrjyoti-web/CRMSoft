import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SuspendTenantCommand } from './suspend-tenant.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(SuspendTenantCommand)
export class SuspendTenantHandler implements ICommandHandler<SuspendTenantCommand> {
  private readonly logger = new Logger(SuspendTenantHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SuspendTenantCommand) {
    const tenant = await this.prisma.identity.tenant.update({
      where: { id: command.tenantId },
      data: { status: 'SUSPENDED' },
    });

    this.logger.log(`Tenant suspended: ${tenant.id}`);
    return tenant;
  }
}
