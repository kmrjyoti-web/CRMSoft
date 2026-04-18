import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRawContactDto } from './dto/create-raw-contact.dto';
import { VerifyRawContactDto } from './dto/verify-raw-contact.dto';
import { RejectRawContactDto } from './dto/reject-raw-contact.dto';
import { UpdateRawContactDto } from './dto/update-raw-contact.dto';
import { RawContactQueryDto } from './dto/raw-contact-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class RawContactsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateRawContactDto, userId: string): Promise<ApiResponse<any>>;
    findAll(query: RawContactQueryDto): Promise<ApiResponse<unknown[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateRawContactDto): Promise<ApiResponse<any>>;
    verify(id: string, dto: VerifyRawContactDto, userId: string): Promise<ApiResponse<any>>;
    reject(id: string, dto: RejectRawContactDto): Promise<ApiResponse<any>>;
    markDuplicate(id: string): Promise<ApiResponse<any>>;
    reopen(id: string): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reactivate(id: string): Promise<ApiResponse<any>>;
    softDelete(id: string, userId: string): Promise<ApiResponse<any>>;
    restore(id: string): Promise<ApiResponse<any>>;
    permanentDelete(id: string): Promise<ApiResponse<{
        id: string;
        deleted: boolean;
    }>>;
}
