import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { LinkContactToOrgCommand } from './link-contact-to-org.command';
import { IContactOrgRepository } from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class LinkContactToOrgHandler implements ICommandHandler<LinkContactToOrgCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IContactOrgRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: LinkContactToOrgCommand): Promise<string>;
}
