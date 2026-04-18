"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combine = combine;
exports.fromAsync = fromAsync;
exports.fromNullable = fromNullable;
exports.ensure = ensure;
const result_1 = require("./result");
function combine(results) {
    const values = [];
    for (const result of results) {
        if (result.isFail) {
            return result_1.Result.fail(result.error.code, result.error.interpolated);
        }
        values.push(result.value);
    }
    return result_1.Result.ok(values);
}
async function fromAsync(fn, failCode = 'OPERATION_FAILED') {
    try {
        const value = await fn();
        return result_1.Result.ok(value);
    }
    catch {
        return result_1.Result.fail(failCode);
    }
}
function fromNullable(value, failCode, interpolations) {
    if (value === null || value === undefined) {
        return result_1.Result.fail(failCode, interpolations);
    }
    return result_1.Result.ok(value);
}
function ensure(value, predicate, failCode, interpolations) {
    if (predicate(value)) {
        return result_1.Result.ok(value);
    }
    return result_1.Result.fail(failCode, interpolations);
}
//# sourceMappingURL=result.helpers.js.map