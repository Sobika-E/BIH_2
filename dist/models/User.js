"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    department: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    year: { type: Number, required: true, min: 1, max: 4 },
    rollNumber: { type: String, required: true, trim: true, minlength: 2, maxlength: 40, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    mobileNumber: { type: String, required: true, trim: true, minlength: 10, maxlength: 15 },
    passwordHash: { type: String, required: true, select: false },
    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    joinedCommunity: { type: Boolean, default: false },
    reputationScore: { type: Number, default: 0 },
    contributionCount: { type: Number, default: 0 },
    acceptedAnswersCount: { type: Number, default: 0 },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenIssuedAt: { type: Date, default: null, select: false },
}, { timestamps: true });
exports.User = mongoose_1.default.model('User', userSchema);
