import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateTenantCommand } from './create-tenant.command';
import { TenantProvisioningService } from '../../../services/tenant-provisioning.service';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  private readonly logger = new Logger(CreateTenantHandler.name);

  constructor(
    private readonly provisioningService: TenantProvisioningService,
  ) {}

  async execute(command: CreateTenantCommand) {
    const hashedPassword = await bcrypt.hash(command.adminPassword, 12);

    const result = await this.provisioningService.provision({
      name: command.name,
      slug: command.slug,
      adminEmail: command.adminEmail,
      adminPassword: hashedPassword,
      adminFirstName: command.adminFirstName,
      adminLastName: command.adminLastName,
      planId: command.planId,
    });

    this.logger.log(`Tenant created: ${result.tenant.id} (${command.name})`);
    return result;
  }
}
