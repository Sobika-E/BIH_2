"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    status;
    code;
    details;
    constructor(status, message, opts) {
        super(message);
        this.status = status;
        this.code = opts?.code;
        this.details = opts?.details;
    }
}
exports.HttpError = HttpError;
