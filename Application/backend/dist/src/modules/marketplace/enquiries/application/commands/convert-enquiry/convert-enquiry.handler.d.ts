import { ICommandHandler } from '@nestjs/cqrs';
import { ConvertEnquiryCommand } from './convert-enquiry.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ConvertEnquiryHandler implements ICommandHandler<ConvertEnquiryCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: ConvertEnquiryCommand): Promise<void>;
}
