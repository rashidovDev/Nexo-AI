"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const express_1 = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// GET all chats for the authenticated user
router.get('/chats', authMiddleware, chat_controller_1.default.listMyChats);
//Create group chat
router.post('/group', authMiddleware, chat_controller_1.default.createGroup);
exports.default = router;
