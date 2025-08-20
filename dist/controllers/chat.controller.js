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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import {User}  from "../models/User.model";
const validator_1 = require("../libs/utils/validator");
const Chat_service_1 = __importDefault(require("../services/Chat.service"));
const Error_1 = __importStar(require("../libs/utils/Error"));
const chatService = new Chat_service_1.default();
const chatController = {};
chatController.listMyChats = async (req, res) => {
    const userId = req.user._id;
    try {
        const result = await chatService.getMyChats(userId);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
chatController.getOrCreateDM = async (req, res) => {
    const userId = req.user._id;
    const parsed = validator_1.createDMOrGetSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: parsed.error.message });
    const otherId = parsed.data.userId;
    try {
        const result = await chatService.getOrCreateDM(userId, otherId);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
chatController.createGroup = async (req, res) => {
    const userId = req.user._id;
    const parsed = validator_1.createGroupSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json(parsed.error);
    const { name, participantIds } = parsed.data;
    try {
        const result = await chatService.createGroup(userId, name, participantIds);
        res.status(Error_1.HttpCode.CREATED).json(result);
    }
    catch (err) {
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
exports.default = chatController;
