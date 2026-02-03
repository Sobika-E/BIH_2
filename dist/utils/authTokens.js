"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hashToken = hashToken;
exports.compareToken = compareToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
const node_crypto_1 = __importDefault(require("node:crypto"));
function signAccessToken(userId) {
    const payload = { sub: userId };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_TTL_SECONDS });
}
function base64UrlRandom(bytes = 32) {
    return node_crypto_1.default.randomBytes(bytes).toString('base64url');
}
function createRefreshToken(userId) {
    const rti = base64UrlRandom(32);
    const payload = { sub: userId, rti };
    const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.REFRESH_TOKEN_TTL_SECONDS });
    return { token, rti };
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
}
async function hashToken(tokenOrRti) {
    const saltRounds = 12;
    return bcrypt_1.default.hash(tokenOrRti, saltRounds);
}
async function compareToken(tokenOrRti, hash) {
    return bcrypt_1.default.compare(tokenOrRti, hash);
}
