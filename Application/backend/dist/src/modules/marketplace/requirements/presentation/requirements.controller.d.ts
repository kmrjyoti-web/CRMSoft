import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PostRequirementDto } from './dto/post-requirement.dto';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
export declare class RequirementsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    postRequirement(dto: PostRequirementDto, userId: string, tenantId: string): Promise<ApiResponse<{
        id: any;
    }>>;
    listRequirements(tenantId: string, page?: string, limit?: string, categoryId?: string, authorId?: string, search?: string): Promise<ApiResponse<unknown[]>>;
    getRequirement(id: string, tenantId: string): Promise<ApiResponse<any>>;
    submitQuote(requirementId: string, dto: SubmitQuoteDto, userId: string, tenantId: string): Promise<ApiResponse<{
        id: any;
    }>>;
    getQuotes(requirementId: string, tenantId: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    acceptQuote(requirementId: string, quoteId: string, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    rejectQuote(requirementId: string, quoteId: string, userId: string, tenantId: string): Promise<ApiResponse<any>>;
}
