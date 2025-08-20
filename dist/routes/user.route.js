"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const express_1 = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// SIGNUP and LOGIN
router.post('/signup', user_controller_1.default.signup);
router.post('/login', user_controller_1.default.login);
// UPLOAD and DELETE USER IMAGE
router.post('/upload-image', authMiddleware, user_controller_1.default.uploadProfileImage);
router.delete('/delete-image', authMiddleware, user_controller_1.default.deleteProfileImage);
// GET USER BY ID
router.get('/user-id/:userId', authMiddleware, user_controller_1.default.getUserById);
// GET USER
router.get('/user-info', authMiddleware, user_controller_1.default.getUserDetails);
// SEARCH BY USERNAME
router.get('/', authMiddleware, user_controller_1.default.searchUser);
//GET ALL USERS
router.get('/all', user_controller_1.default.getAllUsers);
exports.default = router;
