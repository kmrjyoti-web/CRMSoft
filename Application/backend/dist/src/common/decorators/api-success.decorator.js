"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccess = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiSuccess = (model, statusCode = 200) => {
    const ResponseDecorator = statusCode === 201 ? swagger_1.ApiCreatedResponse : swagger_1.ApiOkResponse;
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(model), ResponseDecorator({
        schema: {
            allOf: [
                {
                    properties: {
                        success: { type: 'boolean', example: true },
                        statusCode: { type: 'number', example: statusCode },
                        message: { type: 'string', example: 'Success' },
                        data: { $ref: (0, swagger_1.getSchemaPath)(model) },
                        timestamp: {
                            type: 'string',
                            example: '2026-02-27T10:30:00.000Z',
                        },
                        path: { type: 'string', example: '/api/v1/resource' },
                        requestId: { type: 'string', example: 'req_abc123def456' },
                    },
                },
            ],
        },
    }));
};
exports.ApiSuccess = ApiSuccess;
//# sourceMappingURL=api-success.decorator.js.map