"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const authTokens_1 = require("../utils/authTokens");
const env_1 = require("../config/env");
const authRequired_1 = require("../middleware/authRequired");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2).max(80),
    department: zod_1.z.string().min(2).max(80),
    year: zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(2), zod_1.z.literal(3), zod_1.z.literal(4)]),
    rollNumber: zod_1.z.string().min(2).max(40),
    email: zod_1.z.string().email(),
    mobileNumber: zod_1.z
        .string()
        .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    password: zod_1.z.string().min(8).max(72),
    confirmPassword: zod_1.z.string().min(8).max(72),
})
    .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
    .refine((v) => /[A-Z]/.test(v.password), { path: ['password'], message: 'Password must contain an uppercase letter' })
    .refine((v) => /[a-z]/.test(v.password), { path: ['password'], message: 'Password must contain a lowercase letter' })
    .refine((v) => /[0-9]/.test(v.password), { path: ['password'], message: 'Password must contain a number' })
    .refine((v) => /[^A-Za-z0-9]/.test(v.password), {
    path: ['password'],
    message: 'Password must contain a special character',
});
const loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1), // email or rollNumber
    password: zod_1.z.string().min(1),
});
function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: env_1.env.REFRESH_TOKEN_TTL_SECONDS * 1000,
    };
}
router.post('/signup', async (req, res, next) => {
    try {
        const data = signupSchema.parse(req.body);
        const email = data.email.toLowerCase().trim();
        const rollNumber = data.rollNumber.trim();
        const existing = await User_1.User.findOne({ $or: [{ email }, { rollNumber }] }).lean();
        if (existing)
            throw new httpError_1.HttpError(409, 'Email or Roll Number already registered', { code: 'USER_EXISTS' });
        const passwordHash = await bcrypt_1.default.hash(data.password, 12);
        const user = await User_1.User.create({
            name: data.name.trim(),
            department: data.department.trim(),
            year: data.year,
            rollNumber,
            email,
            mobileNumber: data.mobileNumber.trim(),
            passwordHash,
        });
        return res.status(201).json({
            message: 'Signup successful',
            user: { id: user.id, name: user.name, year: user.year, email: user.email, rollNumber: user.rollNumber },
        });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const identifier = data.identifier.trim().toLowerCase();
        const user = await User_1.User.findOne({
            $or: [{ email: identifier }, { rollNumber: data.identifier.trim() }],
        }).select('+passwordHash +refreshTokenHash +refreshTokenIssuedAt');
        if (!user)
            throw new httpError_1.HttpError(401, 'Invalid credentials', { code: 'INVALID_CREDENTIALS' });
        const ok = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!ok)
            throw new httpError_1.HttpError(401, 'Invalid credentials', { code: 'INVALID_CREDENTIALS' });
        const accessToken = (0, authTokens_1.signAccessToken)(user.id);
        const { token: refreshToken, rti } = (0, authTokens_1.createRefreshToken)(user.id);
        user.refreshTokenHash = await (0, authTokens_1.hashToken)(rti);
        user.refreshTokenIssuedAt = new Date();
        await user.save();
        res.cookie('refresh_token', refreshToken, refreshCookieOptions());
        return res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                department: user.department,
                year: user.year,
                rollNumber: user.rollNumber,
                email: user.email,
                mobileNumber: user.mobileNumber,
                skills: user.skills,
                experience: user.experience,
                githubUrl: user.githubUrl,
                linkedinUrl: user.linkedinUrl,
                joinedCommunity: user.joinedCommunity,
                reputationScore: user.reputationScore,
                contributionCount: user.contributionCount,
                acceptedAnswersCount: user.acceptedAnswersCount,
            },
        });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies?.refresh_token;
        if (!token)
            throw new httpError_1.HttpError(401, 'Missing refresh token', { code: 'REFRESH_MISSING' });
        let payload;
        try {
            payload = (0, authTokens_1.verifyRefreshToken)(token);
        }
        catch {
            throw new httpError_1.HttpError(401, 'Invalid refresh token', { code: 'REFRESH_INVALID' });
        }
        const user = await User_1.User.findById(payload.sub).select('+refreshTokenHash +refreshTokenIssuedAt');
        if (!user?.refreshTokenHash)
            throw new httpError_1.HttpError(401, 'Refresh token not recognized', { code: 'REFRESH_INVALID' });
        const ok = await (0, authTokens_1.compareToken)(payload.rti, user.refreshTokenHash);
        if (!ok)
            throw new httpError_1.HttpError(401, 'Refresh token not recognized', { code: 'REFRESH_INVALID' });
        const accessToken = (0, authTokens_1.signAccessToken)(user.id);
        return res.json({ accessToken });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/logout', async (req, res, next) => {
    try {
        const token = req.cookies?.refresh_token;
        if (token) {
            try {
                const payload = (0, authTokens_1.verifyRefreshToken)(token);
                await User_1.User.findByIdAndUpdate(payload.sub, { $set: { refreshTokenHash: null, refreshTokenIssuedAt: null } });
            }
            catch {
                // ignore
            }
        }
        res.clearCookie('refresh_token', { ...refreshCookieOptions(), maxAge: 0 });
        return res.json({ message: 'Logged out' });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/me', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.userId).lean();
        if (!user)
            throw new httpError_1.HttpError(404, 'User not found', { code: 'USER_NOT_FOUND' });
        return res.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                department: user.department,
                year: user.year,
                rollNumber: user.rollNumber,
                email: user.email,
                mobileNumber: user.mobileNumber,
                skills: user.skills,
                experience: user.experience,
                githubUrl: user.githubUrl,
                linkedinUrl: user.linkedinUrl,
                joinedCommunity: user.joinedCommunity,
                reputationScore: user.reputationScore,
                contributionCount: user.contributionCount,
                acceptedAnswersCount: user.acceptedAnswersCount,
            },
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;



