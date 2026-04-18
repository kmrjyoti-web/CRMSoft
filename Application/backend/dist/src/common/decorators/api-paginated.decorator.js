"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPaginated = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiPaginated = (model) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(model), (0, swagger_1.ApiOkResponse)({
        schema: {
            allOf: [
                {
                    properties: {
                        success: { type: 'boolean', example: true },
                        statusCode: { type: 'number', example: 200 },
                        message: { type: 'string', example: 'Data fetched successfully' },
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(model) },
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: { type: 'number', example: 1 },
                                limit: { type: 'number', example: 20 },
                                total: { type: 'number', example: 142 },
                                totalPages: { type: 'number', example: 8 },
                                hasNext: { type: 'boolean', example: true },
                                hasPrevious: { type: 'boolean', example: false },
                            },
                        },
                        timestamp: { type: 'string', example: '2026-02-27T10:30:00.000Z' },
                        path: { type: 'string', example: '/api/v1/leads' },
                        requestId: { type: 'string', example: 'req_abc123def456' },
                    },
                },
            ],
        },
    }));
};
exports.ApiPaginated = ApiPaginated;
//# sourceMappingURL=api-paginated.decorator.js.map