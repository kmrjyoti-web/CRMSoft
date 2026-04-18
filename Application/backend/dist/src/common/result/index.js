"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensure = exports.fromNullable = exports.fromAsync = exports.combine = exports.Result = void 0;
var result_1 = require("./result");
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_1.Result; } });
var result_helpers_1 = require("./result.helpers");
Object.defineProperty(exports, "combine", { enumerable: true, get: function () { return result_helpers_1.combine; } });
Object.defineProperty(exports, "fromAsync", { enumerable: true, get: function () { return result_helpers_1.fromAsync; } });
Object.defineProperty(exports, "fromNullable", { enumerable: true, get: function () { return result_helpers_1.fromNullable; } });
Object.defineProperty(exports, "ensure", { enumerable: true, get: function () { return result_helpers_1.ensure; } });
//# sourceMappingURL=index.js.map