"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRequired_1 = require("../middleware/authRequired");
const User_1 = require("../models/User");
const httpError_1 = require("../utils/httpError");
const router = (0, express_1.Router)();
router.post('/join', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.userId);
        if (!user)
            throw new httpError_1.HttpError(404, 'User not found');
        if (!user.joinedCommunity) {
            user.joinedCommunity = true;
            await user.save();
        }
        return res.json({ joinedCommunity: user.joinedCommunity });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
