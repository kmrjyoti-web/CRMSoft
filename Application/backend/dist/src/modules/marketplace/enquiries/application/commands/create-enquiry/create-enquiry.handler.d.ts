import { ICommandHandler } from '@nestjs/cqrs';
import { CreateEnquiryCommand } from './create-enquiry.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CreateEnquiryHandler implements ICommandHandler<CreateEnquiryCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: CreateEnquiryCommand): Promise<string>;
}
