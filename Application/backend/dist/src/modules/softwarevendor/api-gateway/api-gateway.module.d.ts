import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export declare class ApiGatewayModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
