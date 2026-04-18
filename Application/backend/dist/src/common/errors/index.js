"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsModule = exports.ErrorCatalogService = exports.ErrorLoggerService = exports.GlobalExceptionFilter = exports.TOTAL_ERROR_CODES = exports.ERROR_CODES = exports.CatalogException = exports.AppError = void 0;
var app_error_1 = require("./app-error");
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return app_error_1.AppError; } });
var catalog_exception_1 = require("./catalog-exception");
Object.defineProperty(exports, "CatalogException", { enumerable: true, get: function () { return catalog_exception_1.CatalogException; } });
var error_codes_1 = require("./error-codes");
Object.defineProperty(exports, "ERROR_CODES", { enumerable: true, get: function () { return error_codes_1.ERROR_CODES; } });
Object.defineProperty(exports, "TOTAL_ERROR_CODES", { enumerable: true, get: function () { return error_codes_1.TOTAL_ERROR_CODES; } });
var global_exception_filter_1 = require("./global-exception.filter");
Object.defineProperty(exports, "GlobalExceptionFilter", { enumerable: true, get: function () { return global_exception_filter_1.GlobalExceptionFilter; } });
var error_logger_service_1 = require("./error-logger.service");
Object.defineProperty(exports, "ErrorLoggerService", { enumerable: true, get: function () { return error_logger_service_1.ErrorLoggerService; } });
var error_catalog_service_1 = require("./error-catalog.service");
Object.defineProperty(exports, "ErrorCatalogService", { enumerable: true, get: function () { return error_catalog_service_1.ErrorCatalogService; } });
var errors_module_1 = require("./errors.module");
Object.defineProperty(exports, "ErrorsModule", { enumerable: true, get: function () { return errors_module_1.ErrorsModule; } });
//# sourceMappingURL=index.js.map