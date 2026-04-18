import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AttachDocumentDto } from './dto/attachment.dto';
export declare class AttachmentController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    attach(dto: AttachDocumentDto, userId: string): Promise<ApiResponse<any>>;
    detach(documentId: string, entityType: string, entityId: string, userId: string): Promise<ApiResponse<null>>;
    getEntityDocuments(entityType: string, entityId: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
}
