"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const httpError_1 = require("../utils/httpError");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
    }
    if (err instanceof httpError_1.HttpError) {
        return res.status(err.status).json({
            message: err.message,
            code: err.code ?? 'HTTP_ERROR',
            details: err.details,
        });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
}
