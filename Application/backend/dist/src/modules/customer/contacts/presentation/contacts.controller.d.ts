import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class ContactsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateContactDto, userId: string): Promise<ApiResponse<any>>;
    getDashboard(tenantId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<any>>;
    findAll(query: ContactQueryDto): Promise<ApiResponse<unknown[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateContactDto, userId: string): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reactivate(id: string): Promise<ApiResponse<any>>;
    softDelete(id: string, userId: string): Promise<ApiResponse<any>>;
    restore(id: string): Promise<ApiResponse<any>>;
    permanentDelete(id: string): Promise<ApiResponse<{
        id: string;
        deleted: boolean;
    }>>;
}
