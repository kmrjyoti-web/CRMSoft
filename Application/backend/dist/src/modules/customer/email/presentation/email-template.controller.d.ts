import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, PreviewTemplateDto } from './dto/template.dto';
export declare class EmailTemplateController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTemplateDto, user: any): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateTemplateDto): Promise<ApiResponse<any>>;
    delete(id: string): Promise<ApiResponse<null>>;
    list(query: TemplateQueryDto): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    preview(id: string, dto: PreviewTemplateDto): Promise<ApiResponse<any>>;
}
