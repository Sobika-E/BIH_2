"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(4000),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    MONGODB_URI: zod_1.z.string().min(1),
    CLIENT_ORIGIN: zod_1.z.string().min(1),
    ACCESS_TOKEN_TTL_SECONDS: zod_1.z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL_SECONDS: zod_1.z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
    JWT_ACCESS_SECRET: zod_1.z.string().min(20),
    JWT_REFRESH_SECRET: zod_1.z.string().min(20),
});
exports.env = envSchema.parse(process.env);
