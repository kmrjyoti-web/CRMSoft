import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { LinkCloudFileDto } from './dto/cloud.dto';
import { SearchDocumentsDto } from './dto/search.dto';
export declare class DocumentController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    upload(file: Express.Multer.File, dto: UploadDocumentDto, userId: string): Promise<ApiResponse<any>>;
    linkCloud(dto: LinkCloudFileDto, userId: string): Promise<ApiResponse<any>>;
    list(dto: DocumentQueryDto): Promise<ApiResponse<unknown[]>>;
    search(dto: SearchDocumentsDto): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateDocumentDto, userId: string): Promise<ApiResponse<any>>;
    delete(id: string, userId: string): Promise<ApiResponse<null>>;
    move(id: string, folderId: string | null, userId: string): Promise<ApiResponse<any>>;
    uploadVersion(id: string, file: Express.Multer.File, userId: string): Promise<ApiResponse<any>>;
    getVersions(id: string): Promise<ApiResponse<any>>;
    getActivity(id: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
}
