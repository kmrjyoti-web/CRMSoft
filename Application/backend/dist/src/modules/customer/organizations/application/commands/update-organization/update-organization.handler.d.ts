import { ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { UpdateOrganizationCommand } from './update-organization.command';
import { IOrganizationRepository } from '../../../domain/interfaces/organization-repository.interface';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationCommand> {
    private readonly repo;
    private readonly publisher;
    private readonly prisma;
    private readonly logger;
    constructor(repo: IOrganizationRepository, publisher: EventPublisher, prisma: PrismaService);
    execute(command: UpdateOrganizationCommand): Promise<void>;
}
