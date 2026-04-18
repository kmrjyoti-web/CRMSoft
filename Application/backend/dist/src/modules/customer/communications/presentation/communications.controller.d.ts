import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddCommunicationDto } from './dto/add-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { LinkToEntityDto } from './dto/link-to-entity.dto';
import { CommunicationsByEntityDto } from './dto/communications-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class CommunicationsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    add(dto: AddCommunicationDto): Promise<ApiResponse<any>>;
    findByEntity(query: CommunicationsByEntityDto): Promise<ApiResponse<any>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateCommunicationDto): Promise<ApiResponse<any>>;
    remove(id: string): Promise<ApiResponse<null>>;
    setPrimary(id: string): Promise<ApiResponse<any>>;
    markVerified(id: string): Promise<ApiResponse<any>>;
    linkToEntity(id: string, dto: LinkToEntityDto): Promise<ApiResponse<any>>;
}
