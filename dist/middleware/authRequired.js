"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
const httpError_1 = require("../utils/httpError");
const authTokens_1 = require("../utils/authTokens");
function authRequired(req, _res, next) {
    const authHeader = req.header('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    if (!token)
        return next(new httpError_1.HttpError(401, 'Authentication required', { code: 'AUTH_REQUIRED' }));
    try {
        const payload = (0, authTokens_1.verifyAccessToken)(token);
        req.userId = payload.sub;
        return next();
    }
    catch {
        return next(new httpError_1.HttpError(401, 'Session expired. Please log in again.', { code: 'TOKEN_INVALID_OR_EXPIRED' }));
    }
}
