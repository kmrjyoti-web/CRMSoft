import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './create-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: CreateOrganizationCommand): Promise<string>;
}
