import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RestoreOrganizationCommand } from './restore-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
export declare class RestoreOrganizationHandler implements ICommandHandler<RestoreOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher);
    execute(command: RestoreOrganizationCommand): Promise<void>;
}
