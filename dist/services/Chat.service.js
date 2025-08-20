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
const Chat_model_1 = __importDefault(require("../models/Chat.model"));
const Error_1 = __importStar(require("../libs/utils/Error"));
class ChatService {
    constructor() {
        this.chatModel = Chat_model_1.default;
    }
    async getMyChats(userId) {
        try {
            const chats = await this.chatModel.find({ participants: userId })
                .populate("participants", "username userImage")
                .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "username userImage" },
            })
                .sort({ updatedAt: -1 });
            return chats.map(chat => chat.toJSON());
        }
        catch (err) {
            console.log("Error , model:signup", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATION_FAILED);
        }
    }
    async getOrCreateDM(userId, otherId) {
        if (userId === otherId) {
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CANNOT_DM_SELF);
        }
        let chat = await this.chatModel.findOne({
            isGroup: false,
            participants: { $all: [userId, otherId], $size: 2 },
        });
        if (!chat) {
            chat = await this.chatModel.create({
                isGroup: false,
                participants: [userId, otherId],
            });
        }
        await chat.populate("participants", "username userImage");
        return chat.toJSON();
    }
    async createGroup(userId, name, participantIds) {
        // ensure creator is part of the group
        const participants = Array.from(new Set([userId, ...participantIds]));
        const chat = await this.chatModel.create({
            isGroup: true,
            name,
            participants,
            admins: [userId],
        });
        await chat.populate("participants", "username userImage");
        return chat.toJSON();
    }
}
exports.default = ChatService;
