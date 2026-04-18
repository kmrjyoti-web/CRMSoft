import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateContactCommand } from './update-contact.command';
import { IContactRepository } from '../../../domain/interfaces/contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateContactHandler implements ICommandHandler<UpdateContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IContactRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: UpdateContactCommand): Promise<void>;
}
