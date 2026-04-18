import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { DeactivateOrganizationCommand } from './deactivate-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
export declare class DeactivateOrganizationHandler implements ICommandHandler<DeactivateOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher);
    execute(command: DeactivateOrganizationCommand): Promise<void>;
}
