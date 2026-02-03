"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authRequired_1 = require("../middleware/authRequired");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const router = (0, express_1.Router)();
const profileSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.string().trim().min(2).max(40)).max(20),
    experience: zod_1.z.string().trim().max(2000),
    githubUrl: zod_1.z
        .string()
        .trim()
        .url('GitHub URL must be valid')
        .max(200)
        .or(zod_1.z.literal(''))
        .optional(),
    linkedinUrl: zod_1.z
        .string()
        .trim()
        .url('LinkedIn URL must be valid')
        .max(200)
        .or(zod_1.z.literal(''))
        .optional(),
});
router.patch('/me', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const data = profileSchema.parse(req.body);
        const user = await User_1.User.findByIdAndUpdate(req.userId, {
            $set: {
                skills: data.skills,
                experience: data.experience,
                githubUrl: data.githubUrl ?? '',
                linkedinUrl: data.linkedinUrl ?? '',
            },
        }, { new: true }).lean();
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
