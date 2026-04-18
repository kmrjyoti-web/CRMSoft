"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponse = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiErrorResponse = (statusCode, errorCode, description) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiResponse)({
        status: statusCode,
        description,
        schema: {
            properties: {
                success: { type: 'boolean', example: false },
                statusCode: { type: 'number', example: statusCode },
                message: { type: 'string', example: description },
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: errorCode },
                        message: { type: 'string', example: description },
                        details: { type: 'object', nullable: true },
                        suggestion: { type: 'string' },
                        documentationUrl: {
                            type: 'string',
                            example: `/docs/errors#${errorCode}`,
                        },
                    },
                },
                timestamp: {
                    type: 'string',
                    example: '2026-02-27T10:30:00.000Z',
                },
                path: { type: 'string' },
                requestId: { type: 'string', example: 'req_abc123def456' },
            },
        },
    }));
};
exports.ApiErrorResponse = ApiErrorResponse;
//# sourceMappingURL=api-error.decorator.js.map