"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authRequired_1 = require("../middleware/authRequired");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const sortBy = zod_1.z.enum(['reputation', 'accepted', 'contributions']).catch('reputation').parse(req.query.sortBy);
        const year = typeof req.query.year === 'string' ? Number(req.query.year) : undefined;
        const filter = {};
        if (year && [1, 2, 3, 4].includes(year))
            filter.year = year;
        const sort = sortBy === 'accepted'
            ? { acceptedAnswersCount: -1, reputationScore: -1 }
            : sortBy === 'contributions'
                ? { contributionCount: -1, reputationScore: -1 }
                : { reputationScore: -1, acceptedAnswersCount: -1 };
        const users = await User_1.User.find(filter).sort(sort).limit(50).lean();
        return res.json({
            users: users.map((u) => ({
                id: u._id.toString(),
                name: u.name,
                department: u.department,
                year: u.year,
                skills: u.skills,
                experience: u.experience,
                reputationScore: u.reputationScore,
                contributionCount: u.contributionCount,
                acceptedAnswersCount: u.acceptedAnswersCount,
            })),
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
