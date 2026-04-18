import { ICommandHandler } from '@nestjs/cqrs';
import { PermanentDeleteOrganizationCommand } from './permanent-delete-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
export declare class PermanentDeleteOrganizationHandler implements ICommandHandler<PermanentDeleteOrganizationCommand> {
    private readonly repo;
    private readonly logger;
    constructor(repo: IOrganizationRepository);
    execute(command: PermanentDeleteOrganizationCommand): Promise<void>;
}
