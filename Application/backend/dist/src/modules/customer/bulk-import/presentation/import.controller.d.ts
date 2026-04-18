import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { SelectProfileDto, SaveProfileDto } from './dto/upload-file.dto';
import { ApplyMappingDto } from './dto/mapping.dto';
import { RowActionDto, RowBulkActionDto, EditRowDto } from './dto/row-action.dto';
import { ResultReportService } from '../services/result-report.service';
export declare class ImportController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly reportService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, reportService: ResultReportService);
    upload(file: any, dto: any, user: any): Promise<ApiResponse<any>>;
    selectProfile(jobId: string, dto: SelectProfileDto): Promise<ApiResponse<any>>;
    applyMapping(jobId: string, dto: ApplyMappingDto): Promise<ApiResponse<any>>;
    saveProfile(jobId: string, dto: SaveProfileDto): Promise<ApiResponse<any>>;
    validate(jobId: string): Promise<ApiResponse<{
        jobId: string;
        status: string;
    }>>;
    getStatus(jobId: string): Promise<ApiResponse<{
        jobId: any;
        status: any;
        totalRows: any;
        validRows: any;
        invalidRows: any;
        importedCount: any;
        skippedRows: any;
        failedCount: any;
        duplicateExactRows: any;
        duplicateInFileRows: any;
    }>>;
    commit(jobId: string, userId: string): Promise<ApiResponse<{
        jobId: string;
        status: string;
    }>>;
    cancel(jobId: string): Promise<ApiResponse<any>>;
    listJobs(query: any): Promise<ApiResponse<unknown[]>>;
    getJob(jobId: string): Promise<ApiResponse<any>>;
    validationSummary(jobId: string): Promise<ApiResponse<any>>;
    duplicates(jobId: string, q: any): Promise<ApiResponse<unknown[]>>;
    result(jobId: string): Promise<ApiResponse<any>>;
    downloadReport(jobId: string, type: string): Promise<ApiResponse<{
        downloadUrl: string | undefined;
    }>>;
    getRows(jobId: string, q: any): Promise<ApiResponse<unknown[]>>;
    getRow(jobId: string, rowId: string): Promise<ApiResponse<any>>;
    editRow(jobId: string, rowId: string, dto: EditRowDto): Promise<ApiResponse<any>>;
    rowAction(jobId: string, rowId: string, dto: RowActionDto): Promise<ApiResponse<any>>;
    revalidateRow(jobId: string, rowId: string): Promise<ApiResponse<any>>;
    bulkAction(jobId: string, dto: RowBulkActionDto): Promise<ApiResponse<any>>;
    mappingSuggestions(entity: string, headers?: string): Promise<ApiResponse<any>>;
}
