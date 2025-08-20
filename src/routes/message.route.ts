import messageController from '../controllers/message.controller';
import { Router } from 'express';
const authMiddleware = require("../middleware/auth.middleware")

const router = Router();
// GET MESSAGES IN A CHAT
router.get('/chat-id/:chatId', authMiddleware, messageController.getMessages);
// SEND MESSAGE
router.post('/send-msg', authMiddleware, messageController.sendMessage);
// MARK AS READ
router.post('/mark-read', authMiddleware, messageController.markMessageAsRead);


export default router;