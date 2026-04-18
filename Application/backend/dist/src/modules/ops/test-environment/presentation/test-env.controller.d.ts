import { MessageEvent } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTestEnvDto } from './dto/create-test-env.dto';
import { ITestEnvRepository } from '../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../infrastructure/db-operations.service';
export declare class TestEnvController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly repo;
    private readonly dbOps;
    constructor(commandBus: CommandBus, queryBus: QueryBus, repo: ITestEnvRepository, dbOps: DbOperationsService);
    create(tenantId: string, userId: string, dto: CreateTestEnvDto): Promise<ApiResponse<any>>;
    list(tenantId: string, status?: string, page?: number, limit?: number): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    progress(id: string): Observable<MessageEvent>;
    cleanup(id: string, userId: string): Promise<ApiResponse<any>>;
    extendTtl(id: string, body: {
        additionalHours: number;
    }): Promise<ApiResponse<any>>;
    getConnectionInfo(id: string): Promise<ApiResponse<{
        host: string;
        port: number;
        database: string;
        user: string;
        passwordHint: string;
        jdbcUrl: string;
        status: any;
        expiresAt: any;
    }>>;
}
