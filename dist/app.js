"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const questions_1 = __importDefault(require("./routes/questions"));
const contributors_1 = __importDefault(require("./routes/contributors"));
const profile_1 = __importDefault(require("./routes/profile"));
const membership_1 = __importDefault(require("./routes/membership"));
function createApp() {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    app.use((0, helmet_1.default)());
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    app.use((0, cors_1.default)({
        origin: env_1.env.CLIENT_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_rate_limit_1.default)({
        windowMs: 60_000,
        limit: 120,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use(express_1.default.json({ limit: '200kb' }));
    app.use((0, cookie_parser_1.default)());
    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.use('/api/auth', auth_1.default);
    app.use('/api/questions', questions_1.default);
    app.use('/api/contributors', contributors_1.default);
    app.use('/api/profile', profile_1.default);
    app.use('/api/membership', membership_1.default);
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
