import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { VerifyRawContactCommand } from './verify-raw-contact.command';
import { IRawContactRepository } from '../../../domain/interfaces/raw-contact-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class VerifyRawContactHandler implements ICommandHandler<VerifyRawContactCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IRawContactRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: VerifyRawContactCommand): Promise<string>;
}
