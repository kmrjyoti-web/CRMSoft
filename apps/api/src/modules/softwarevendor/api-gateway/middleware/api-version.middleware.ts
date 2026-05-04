import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SUPPORTED_VERSIONS = ['v1'];
const DEFAULT_VERSION = 'v1';

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract version from URL path, header, or query param
    let version = DEFAULT_VERSION;

    // 1. Check URL path: /api/v1/...
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      version = pathMatch[1];
    }

    // 2. Check header: X-Api-Version
    const headerVersion = req.headers['x-api-version'] as string;
    if (headerVersion) {
      version = headerVersion;
    }

    // 3. Check query param: ?api_version=v1
    if (req.query.api_version) {
      version = req.query.api_version as string;
    }

    // Validate version
    if (!SUPPORTED_VERSIONS.includes(version)) {
      res.status(400).json({
        success: false,
        errorCode: 'API_VERSION_UNSUPPORTED',
        message: `API version '${version}' is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
        supportedVersions: SUPPORTED_VERSIONS,
      });
      return;
    }

    // Attach to request
    (req as any).apiVersion = version;
    res.setHeader('X-Api-Version', version);

    next();
  }
}
