import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UnlinkContactFromOrgCommand } from './unlink-contact-from-org.command';
import { IContactOrgRepository } from '../../../domain/interfaces/contact-org-repository.interface';
export declare class UnlinkContactFromOrgHandler implements ICommandHandler<UnlinkContactFromOrgCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactOrgRepository, publisher: EventPublisher);
    execute(command: UnlinkContactFromOrgCommand): Promise<void>;
}
