"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_controller_1 = __importDefault(require("../controllers/message.controller"));
const express_1 = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET MESSAGES IN A CHAT
router.get('/chat-id/:chatId', authMiddleware, message_controller_1.default.getMessages);
// SEND MESSAGE
router.post('/send-msg', authMiddleware, message_controller_1.default.sendMessage);
// MARK AS READ
router.post('/mark-read', authMiddleware, message_controller_1.default.markMessageAsRead);
exports.default = router;
