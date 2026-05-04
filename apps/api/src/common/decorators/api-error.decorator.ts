import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Swagger decorator for error responses.
 *
 * Usage:
 *   @ApiErrorResponse(404, 'LEAD_NOT_FOUND', 'Lead does not exist')
 *   @ApiErrorResponse(400, 'VALIDATION_ERROR', 'Validation failed')
 */
export const ApiErrorResponse = (
  statusCode: number,
  errorCode: string,
  description: string,
) => {
  return applyDecorators(
    ApiResponse({
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
    }),
  );
};
