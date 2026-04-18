"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErr = exports.isOk = exports.Err = exports.Ok = exports.ensure = exports.fromNullable = exports.fromAsync = exports.combine = exports.Result = void 0;
var result_1 = require("../result/result");
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_1.Result; } });
var result_helpers_1 = require("../result/result.helpers");
Object.defineProperty(exports, "combine", { enumerable: true, get: function () { return result_helpers_1.combine; } });
Object.defineProperty(exports, "fromAsync", { enumerable: true, get: function () { return result_helpers_1.fromAsync; } });
Object.defineProperty(exports, "fromNullable", { enumerable: true, get: function () { return result_helpers_1.fromNullable; } });
Object.defineProperty(exports, "ensure", { enumerable: true, get: function () { return result_helpers_1.ensure; } });
const Ok = (data) => ({ success: true, data });
exports.Ok = Ok;
const Err = (code, message, statusCode = 400, details) => ({
    success: false,
    error: { code, message, statusCode, details },
});
exports.Err = Err;
const isOk = (result) => result.success === true;
exports.isOk = isOk;
const isErr = (result) => result.success === false;
exports.isErr = isErr;
//# sourceMappingURL=result.type.js.map