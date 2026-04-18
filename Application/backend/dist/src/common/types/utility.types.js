"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = getErrorMessage;
exports.getErrorStack = getErrorStack;
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
function getErrorStack(error) {
    if (error instanceof Error)
        return error.stack;
    return undefined;
}
//# sourceMappingURL=utility.types.js.map