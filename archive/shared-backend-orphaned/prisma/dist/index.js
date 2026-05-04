"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SOFT_DELETE_MODELS = exports.createSoftDeleteMiddleware = exports.PrismaModule = exports.PrismaService = void 0;
var prisma_service_1 = require("./prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });
var prisma_module_1 = require("./prisma.module");
Object.defineProperty(exports, "PrismaModule", { enumerable: true, get: function () { return prisma_module_1.PrismaModule; } });
var soft_delete_middleware_1 = require("./soft-delete.middleware");
Object.defineProperty(exports, "createSoftDeleteMiddleware", { enumerable: true, get: function () { return soft_delete_middleware_1.createSoftDeleteMiddleware; } });
Object.defineProperty(exports, "DEFAULT_SOFT_DELETE_MODELS", { enumerable: true, get: function () { return soft_delete_middleware_1.DEFAULT_SOFT_DELETE_MODELS; } });
//# sourceMappingURL=index.js.map