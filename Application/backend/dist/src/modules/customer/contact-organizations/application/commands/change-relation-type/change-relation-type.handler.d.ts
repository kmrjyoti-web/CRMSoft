import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { ChangeRelationTypeCommand } from './change-relation-type.command';
import { IContactOrgRepository } from '../../../domain/interfaces/contact-org-repository.interface';
export declare class ChangeRelationTypeHandler implements ICommandHandler<ChangeRelationTypeCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly logger;
    constructor(repo: IContactOrgRepository, publisher: EventPublisher);
    execute(command: ChangeRelationTypeCommand): Promise<void>;
}
