import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ReactivateOrganizationCommand } from './reactivate-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
export declare class ReactivateOrganizationHandler implements ICommandHandler<ReactivateOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher);
    execute(command: ReactivateOrganizationCommand): Promise<void>;
}
