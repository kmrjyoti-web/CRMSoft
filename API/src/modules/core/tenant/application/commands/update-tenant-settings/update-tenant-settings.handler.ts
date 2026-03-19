import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTenantSettingsCommand } from './update-tenant-settings.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTenantSettingsCommand)
export class UpdateTenantSettingsHandler implements ICommandHandler<UpdateTenantSettingsCommand> {
  private readonly logger = new Logger(UpdateTenantSettingsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTenantSettingsCommand) {
    const tenant = await this.prisma.tenant.update({
      where: { id: command.tenantId },
      data: { settings: command.settings },
    });

    this.logger.log(`Tenant settings updated: ${tenant.id}`);
    return tenant;
  }
}
