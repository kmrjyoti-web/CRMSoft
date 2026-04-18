import { ICommandHandler } from '@nestjs/cqrs';
import { CreateTenantCommand } from './create-tenant.command';
import { TenantProvisioningService } from '../../../services/tenant-provisioning.service';
export declare class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
    private readonly provisioningService;
    private readonly logger;
    constructor(provisioningService: TenantProvisioningService);
    execute(command: CreateTenantCommand): Promise<{
        tenant: any;
        adminUser: any;
        subscription: any;
    }>;
}
