"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const authRequired_1 = require("../middleware/authRequired");
const Question_1 = require("../models/Question");
const Answer_1 = require("../models/Answer");
const Tag_1 = require("../models/Tag");
const User_1 = require("../models/User");
const AnswerLike_1 = require("../models/AnswerLike");
const httpError_1 = require("../utils/httpError");
const router = (0, express_1.Router)();
const categoryEnum = zod_1.z.enum(['Subjects', 'Placements', 'Exams', 'Labs', 'Projects', 'NSS / Activities']);
const askSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(10).max(160),
    description: zod_1.z.string().trim().min(30).max(20000),
    category: categoryEnum,
    tags: zod_1.z.array(zod_1.z.string().trim().min(2).max(24)).max(8).default([]),
});
router.get('/', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const category = typeof req.query.category === 'string' ? req.query.category : undefined;
        const filter = {};
        if (category && categoryEnum.safeParse(category).success)
            filter.category = category;
        if (q)
            filter.$text = { $search: q };
        const questions = await Question_1.Question.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const authorIds = [...new Set(questions.map((x) => x.authorId.toString()))];
        const authors = await User_1.User.find({ _id: { $in: authorIds } }).select('name year').lean();
        const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));
        return res.json({
            questions: questions.map((qq) => ({
                id: qq._id.toString(),
                title: qq.title,
                descriptionPreview: qq.description.slice(0, 160),
                category: qq.category,
                tags: qq.tags,
                createdAt: qq.createdAt,
                answersCount: qq.answersCount,
                hasAcceptedAnswer: Boolean(qq.acceptedAnswerId),
                likesCount: qq.likesCount,
                author: (() => {
                    const a = authorMap.get(qq.authorId.toString());
                    return a ? { id: a._id.toString(), name: a.name, year: a.year } : null;
                })(),
            })),
        });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const data = askSchema.parse(req.body);
        const tags = [...new Set(data.tags.map((t) => t.toLowerCase()))];
        const user = await User_1.User.findById(req.userId);
        if (!user?.joinedCommunity)
            throw new httpError_1.HttpError(403, 'Join the community before posting');
        const question = await Question_1.Question.create({
            title: data.title,
            description: data.description,
            category: data.category,
            tags,
            authorId: new mongoose_1.default.Types.ObjectId(req.userId),
        });
        if (tags.length) {
            await Promise.all(tags.map((t) => Tag_1.Tag.updateOne({ name: t }, { $inc: { usageCount: 1 } }, { upsert: true }).exec()));
        }
        await User_1.User.findByIdAndUpdate(req.userId, { $inc: { contributionCount: 1, reputationScore: 2 } });
        return res.status(201).json({ id: question._id.toString() });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/:id', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose_1.default.isValidObjectId(id))
            throw new httpError_1.HttpError(400, 'Invalid question id');
        const question = await Question_1.Question.findById(id).lean();
        if (!question)
            throw new httpError_1.HttpError(404, 'Question not found');
        const author = await User_1.User.findById(question.authorId).select('name year').lean();
        const answers = await Answer_1.Answer.find({ questionId: question._id })
            .sort({ isAccepted: -1, createdAt: 1 })
            .lean();
        const answerAuthorIds = [...new Set(answers.map((a) => a.authorId.toString()))];
        const answerAuthors = await User_1.User.find({ _id: { $in: answerAuthorIds } }).select('name year reputationScore').lean();
        const answerAuthorMap = new Map(answerAuthors.map((a) => [a._id.toString(), a]));
        return res.json({
            question: {
                id: question._id.toString(),
                title: question.title,
                description: question.description,
                category: question.category,
                tags: question.tags,
                createdAt: question.createdAt,
                answersCount: question.answersCount,
                hasAcceptedAnswer: Boolean(question.acceptedAnswerId),
                likesCount: question.likesCount,
                author: author ? { id: author._id.toString(), name: author.name, year: author.year } : null,
            },
            answers: answers.map((a) => {
                const u = answerAuthorMap.get(a.authorId.toString());
                return {
                    id: a._id.toString(),
                    body: a.body,
                    isAccepted: a.isAccepted,
                    likesCount: a.likesCount,
                    createdAt: a.createdAt,
                    author: u ? { id: u._id.toString(), name: u.name, year: u.year, reputationScore: u.reputationScore } : null,
                };
            }),
        });
    }
    catch (err) {
        return next(err);
    }
});
const answerSchema = zod_1.z.object({ body: zod_1.z.string().trim().min(10).max(20000) });
router.post('/:id/answers', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const questionId = req.params.id;
        if (!mongoose_1.default.isValidObjectId(questionId))
            throw new httpError_1.HttpError(400, 'Invalid question id');
        const data = answerSchema.parse(req.body);
        const q = await Question_1.Question.findById(questionId);
        if (!q)
            throw new httpError_1.HttpError(404, 'Question not found');
        const user = await User_1.User.findById(req.userId);
        if (!user?.joinedCommunity)
            throw new httpError_1.HttpError(403, 'Join the community before answering');
        const created = await Answer_1.Answer.create({
            questionId: q._id,
            authorId: new mongoose_1.default.Types.ObjectId(req.userId),
            body: data.body,
        });
        await Question_1.Question.updateOne({ _id: q._id }, { $inc: { answersCount: 1 } });
        await User_1.User.updateOne({ _id: req.userId }, { $inc: { contributionCount: 1, reputationScore: 5 } });
        return res.status(201).json({ id: created._id.toString() });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/:questionId/answers/:answerId/accept', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const { questionId, answerId } = req.params;
        if (!mongoose_1.default.isValidObjectId(questionId) || !mongoose_1.default.isValidObjectId(answerId))
            throw new httpError_1.HttpError(400, 'Invalid id');
        const q = await Question_1.Question.findById(questionId);
        if (!q)
            throw new httpError_1.HttpError(404, 'Question not found');
        if (q.authorId.toString() !== req.userId)
            throw new httpError_1.HttpError(403, 'Only the question owner can accept an answer');
        const a = await Answer_1.Answer.findById(answerId);
        if (!a || a.questionId.toString() !== questionId)
            throw new httpError_1.HttpError(404, 'Answer not found');
        if (q.acceptedAnswerId?.toString() === answerId)
            return res.json({ ok: true });
        // unaccept old accepted answer if exists
        if (q.acceptedAnswerId) {
            const old = await Answer_1.Answer.findById(q.acceptedAnswerId);
            if (old) {
                old.isAccepted = false;
                await old.save();
                await User_1.User.updateOne({ _id: old.authorId }, { $inc: { reputationScore: -15, acceptedAnswersCount: -1 } });
            }
        }
        a.isAccepted = true;
        await a.save();
        q.acceptedAnswerId = a._id;
        await q.save();
        await User_1.User.updateOne({ _id: a.authorId }, { $inc: { reputationScore: 15, acceptedAnswersCount: 1 } });
        return res.json({ ok: true });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/:questionId/answers/:answerId/like', authRequired_1.authRequired, async (req, res, next) => {
    try {
        const { questionId, answerId } = req.params;
        if (!mongoose_1.default.isValidObjectId(questionId) || !mongoose_1.default.isValidObjectId(answerId))
            throw new httpError_1.HttpError(400, 'Invalid id');
        const a = await Answer_1.Answer.findById(answerId);
        if (!a || a.questionId.toString() !== questionId)
            throw new httpError_1.HttpError(404, 'Answer not found');
        const user = await User_1.User.findById(req.userId);
        if (!user?.joinedCommunity)
            throw new httpError_1.HttpError(403, 'Join the community before liking answers');
        // toggle like
        const existing = await AnswerLike_1.AnswerLike.findOne({ answerId: a._id, userId: new mongoose_1.default.Types.ObjectId(req.userId) });
        if (existing) {
            await AnswerLike_1.AnswerLike.deleteOne({ _id: existing._id });
            await Answer_1.Answer.updateOne({ _id: a._id }, { $inc: { likesCount: -1 } });
            await User_1.User.updateOne({ _id: a.authorId }, { $inc: { reputationScore: -2 } });
            return res.json({ ok: true });
        }
        await AnswerLike_1.AnswerLike.create({ answerId: a._id, userId: new mongoose_1.default.Types.ObjectId(req.userId) });
        await Answer_1.Answer.updateOne({ _id: a._id }, { $inc: { likesCount: 1 } });
        await User_1.User.updateOne({ _id: a.authorId }, { $inc: { reputationScore: 2 } });
        return res.json({ ok: true });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
