import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
export declare class SoftDeleteOrganizationHandler implements ICommandHandler<SoftDeleteOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher);
    execute(command: SoftDeleteOrganizationCommand): Promise<void>;
}
