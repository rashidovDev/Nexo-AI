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
const Message_model_1 = __importDefault(require("../models/Message.model"));
const Chat_model_1 = __importDefault(require("../models/Chat.model"));
const Error_1 = __importStar(require("../libs/utils/Error"));
class MessageService {
    constructor() {
        this.messageModel = Message_model_1.default;
        this.chatModel = Chat_model_1.default;
    }
    /**
     * Get all messages in a chat
     */
    async getMessages(chatId) {
        try {
            const messages = await this.messageModel
                .find({ chat: chatId
            })
                .populate("sender", "username userImage")
                .populate("readBy.user", "username userImage")
                .sort({ createdAt: 1 });
            return messages.map((m) => m.toJSON());
        }
        catch (err) {
            console.error("Error: getMessages", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.SOMETHING_WENT_WRONG);
        }
    }
    /**
     * Send a message to a chat
     */
    async sendMessage(input) {
        try {
            const { chat, sender, text, attachments, receiver } = input;
            const message = await this.messageModel.create({
                chat,
                sender,
                text,
                attachments,
                receiver,
                readBy: [{ user: sender, at: new Date() }],
            });
            // update chat with lastMessage
            await this.chatModel.findByIdAndUpdate(chat, { lastMessage: message._id });
            await message.populate("sender", "username userImage");
            return message.toJSON();
        }
        catch (err) {
            console.error("Error: sendMessage", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATION_FAILED);
        }
    }
    /**
     * Mark message as read by a user
     */
    async markAsRead(messageId, userId) {
        try {
            const message = await this.messageModel.findByIdAndUpdate(messageId, {
                $addToSet: { readBy: { user: userId, at: new Date() } },
            }, { new: true })
                .populate("sender", "username userImage")
                .populate("readBy.user", "username userImage");
            if (!message) {
                throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NOT_FOUND);
            }
            return message.toJSON();
        }
        catch (err) {
            console.error("Error: markAsRead", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.UPDATE_FAILED);
        }
    }
}
exports.default = MessageService;
