import messageController from '../controllers/message.controller';
import { Router } from 'express';
const authMiddleware = require("../middleware/auth.middleware")

const router = Router();
// GET MESSAGES IN A CHAT

// SEND MESSAGE
router.post('/send-msg', authMiddleware, messageController.sendMessage);
// MARK AS READ
router.post('/mark-read', authMiddleware, messageController.markMessageRead);

router.get('/chat-id/:chatId', authMiddleware, messageController.getMessages);

export default router;