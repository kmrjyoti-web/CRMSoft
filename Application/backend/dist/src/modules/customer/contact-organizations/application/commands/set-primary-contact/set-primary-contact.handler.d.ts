import { ICommandHandler } from '@nestjs/cqrs';
import { SetPrimaryContactCommand } from './set-primary-contact.command';
import { IContactOrgRepository } from '../../../domain/interfaces/contact-org-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class SetPrimaryContactHandler implements ICommandHandler<SetPrimaryContactCommand> {
    private readonly repo;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IContactOrgRepository, prisma: PrismaService);
    execute(command: SetPrimaryContactCommand): Promise<void>;
}
