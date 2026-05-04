import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Swagger decorator for success responses.
 *
 * Usage:
 *   @ApiSuccess(LeadDto)
 *   @ApiSuccess(LeadDto, 201)
 */
export const ApiSuccess = <TModel extends Type<any>>(
  model: TModel,
  statusCode: 200 | 201 = 200,
) => {
  const ResponseDecorator =
    statusCode === 201 ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(model),
    ResponseDecorator({
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              statusCode: { type: 'number', example: statusCode },
              message: { type: 'string', example: 'Success' },
              data: { $ref: getSchemaPath(model) },
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
    }),
  );
};
