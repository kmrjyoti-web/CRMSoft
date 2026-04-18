import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto } from './dto/template.dto';
export declare class WhatsAppTemplatesController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTemplateDto): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateTemplateDto): Promise<ApiResponse<any>>;
    delete(id: string): Promise<ApiResponse<null>>;
    list(dto: TemplateQueryDto): Promise<ApiResponse<unknown[]>>;
    detail(id: string): Promise<ApiResponse<any>>;
    sync(wabaId: string): Promise<ApiResponse<any>>;
}
