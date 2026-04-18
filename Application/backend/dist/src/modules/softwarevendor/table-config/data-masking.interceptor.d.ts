import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { DataMaskingService } from './services/data-masking.service';
export declare const MASK_TABLE_KEY = "mask_table_key";
export declare const MaskTable: (tableKey: string) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare class DataMaskingInterceptor implements NestInterceptor {
    private readonly maskingService;
    private readonly reflector;
    private readonly logger;
    constructor(maskingService: DataMaskingService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
