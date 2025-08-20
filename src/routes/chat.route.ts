import chatController from '../controllers/chat.controller';
import { Router } from 'express';
const authMiddleware = require("../middleware/auth.middleware")

const router = Router();

// GET all chats for the authenticated user
router.get('/chats', authMiddleware, chatController.listMyChats);

//Create group chat
router.post('/group', authMiddleware, chatController.createGroup);


export default router;