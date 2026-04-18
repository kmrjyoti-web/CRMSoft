import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateContactCommand } from './create-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateContactHandler implements ICommandHandler<CreateContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: CreateContactCommand): Promise<string>;
}
