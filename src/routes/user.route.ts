import UserModel from '../models/User.model';
import userController from '../controllers/user.controller';

import { Router } from 'express';

const authMiddleware = require("../middleware/auth.middleware")

const router = Router();

// SIGNUP and LOGIN
// router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/verify', userController.verify);



// SEND OTP
router.post('/send-otp', userController.sendOtp);

// CHANGE EMAIL
router.put('/change-email', authMiddleware, userController.changeUserEmail);

// DELETE USER
router.delete('/delete-user', authMiddleware, userController.deleteUser);

router.post('/create-contact', authMiddleware, userController.createContact);
router.get('/contacts', authMiddleware, userController.getMyContacts);

router.get('/con', async (req, res)  => {
    const users = await UserModel.find().exec(); 
    res.json(users);
});

router.put('/edit-profile', authMiddleware, userController.editUser); 
router.get('/check-username', userController.checkUsername);

// UPLOAD and DELETE USER IMAGE
router.post('/upload-image', authMiddleware, userController.uploadProfileImage);
router.delete('/delete-image', authMiddleware, userController.deleteProfileImage);

// GET USER BY ID
router.get('/user-id/:userId', authMiddleware, userController.getUserById);

// GET USER
router.get('/user-info', authMiddleware, userController.getUserDetails);

// SEARCH BY USERNAME
router.get('/', authMiddleware, userController.searchUser);

// DELETE CONTACT
router.delete('/delete-contact/:contactId', authMiddleware, userController.deleteContact);

//GET ALL USERS
router.get('/all', userController.getAllUsers);




export default router;