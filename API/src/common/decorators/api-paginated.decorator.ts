import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger decorator for paginated endpoints.
 *
 * Usage:
 *   @ApiPaginated(LeadDto)
 *   @Get()
 *   findAll() { ... }
 */
export const ApiPaginated = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              statusCode: { type: 'number', example: 200 },
              message: { type: 'string', example: 'Data fetched successfully' },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
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
    }),
  );
};
