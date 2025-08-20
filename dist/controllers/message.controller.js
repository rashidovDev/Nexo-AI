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
const Message_service_1 = __importDefault(require("../services/Message.service"));
const Error_1 = __importStar(require("../libs/utils/Error"));
const validator_1 = require("../libs/utils/validator");
const Chat_service_1 = __importDefault(require("../services/Chat.service"));
const config_1 = require("../libs/utils/config");
const messageService = new Message_service_1.default();
const chatService = new Chat_service_1.default();
const messageController = {};
/**
 * Get all messages in a chat
 */
messageController.getMessages = async (req, res) => {
    const chatId = req.params.chatId;
    try {
        const result = await messageService.getMessages(chatId);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * Send a message in a chat
 */
messageController.sendMessage = async (req, res) => {
    const sender = req.user._id;
    const parsed = validator_1.sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: parsed.error.message });
    }
    const receiver = Array.isArray(parsed.data.receiver)
        ? parsed.data.receiver[0] // take first for DM
        : parsed.data.receiver;
    if (!receiver) {
        return res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: "Receiver is required." });
    }
    try {
        let chatId = parsed.data.chat
            ? (0, config_1.shapeIntoMongooseObjectId)(parsed.data.chat)
            : null;
        console.log("Parsed chat ID:", chatId);
        // Ensure DM chat exists
        if (!parsed.data.chat) {
            const existingChat = await chatService.getOrCreateDM(sender, receiver);
            chatId = (0, config_1.shapeIntoMongooseObjectId)(existingChat._id);
        }
        // Send message
        const result = await messageService.sendMessage({
            chat: chatId, // <-- important fix // pass only the ID
            sender,
            text: parsed.data.text,
            //   attachments: parsed.data.attachments?.map(att => ({
            //     url: att.url,
            //     type: att.type ?? "unknown"
            //   })),
            receiver: parsed.data.receiver,
        });
        res.status(Error_1.HttpCode.CREATED).json(result);
    }
    catch (err) {
        console.error("Error sending DM:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * Mark a message as read
 */
messageController.markMessageAsRead = async (req, res) => {
    const userId = req.user._id;
    const parsed = validator_1.markReadSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: parsed.error.message });
    }
    const { messageId } = parsed.data;
    try {
        const result = await messageService.markAsRead(messageId, userId);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
exports.default = messageController;
