import userController from '../controllers/user.controller';
import { Router } from 'express';
const authMiddleware = require("../middleware/auth.middleware")

const router = Router();

// SIGNUP and LOGIN
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// UPLOAD and DELETE USER IMAGE
router.post('/upload-image', authMiddleware, userController.uploadProfileImage);
router.delete('/delete-image', authMiddleware, userController.deleteProfileImage);

// GET USER BY ID
router.get('/user-id/:userId', authMiddleware, userController.getUserById);

// GET USER
router.get('/user-info', authMiddleware, userController.getUserDetails);

// SEARCH BY USERNAME
router.get('/', authMiddleware, userController.searchUser);

//GET ALL USERS
router.get('/all', userController.getAllUsers);




export default router;