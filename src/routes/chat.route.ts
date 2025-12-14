import chatController from '../controllers/chat.controller';
import { Router } from 'express';
const authMiddleware = require("../middleware/auth.middleware")

const router = Router();

// GET all chats for the authenticated user
router.get('/chats', authMiddleware, chatController.listMyChats);
router.post('/create-dm', authMiddleware, chatController.getOrCreateDM);

//Create group chat
router.post('/create-group', authMiddleware, chatController.createGroup);


export default router;