import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateTenantCommand } from './update-tenant.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantHandler implements ICommandHandler<UpdateTenantCommand> {
  private readonly logger = new Logger(UpdateTenantHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateTenantCommand) {
    const tenant = await this.prisma.tenant.update({
      where: { id: command.tenantId },
      data: {
        ...(command.name !== undefined && { name: command.name }),
        ...(command.domain !== undefined && { domain: command.domain }),
        ...(command.logo !== undefined && { logo: command.logo }),
        ...(command.settings !== undefined && { settings: command.settings }),
      },
    });

    this.logger.log(`Tenant updated: ${tenant.id}`);
    return tenant;
  }
}
