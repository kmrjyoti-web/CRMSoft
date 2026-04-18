"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionMiddleware = void 0;
const common_1 = require("@nestjs/common");
const SUPPORTED_VERSIONS = ['v1'];
const DEFAULT_VERSION = 'v1';
let ApiVersionMiddleware = class ApiVersionMiddleware {
    use(req, res, next) {
        let version = DEFAULT_VERSION;
        const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
        if (pathMatch) {
            version = pathMatch[1];
        }
        const headerVersion = req.headers['x-api-version'];
        if (headerVersion) {
            version = headerVersion;
        }
        if (req.query.api_version) {
            version = req.query.api_version;
        }
        if (!SUPPORTED_VERSIONS.includes(version)) {
            res.status(400).json({
                success: false,
                errorCode: 'API_VERSION_UNSUPPORTED',
                message: `API version '${version}' is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
                supportedVersions: SUPPORTED_VERSIONS,
            });
            return;
        }
        req.apiVersion = version;
        res.setHeader('X-Api-Version', version);
        next();
    }
};
exports.ApiVersionMiddleware = ApiVersionMiddleware;
exports.ApiVersionMiddleware = ApiVersionMiddleware = __decorate([
    (0, common_1.Injectable)()
], ApiVersionMiddleware);
//# sourceMappingURL=api-version.middleware.js.map