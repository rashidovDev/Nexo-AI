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
const User_service_1 = __importDefault(require("../services/User.service"));
const Error_1 = __importStar(require("../libs/utils/Error"));
const Auth_service_1 = __importDefault(require("../services/Auth.service"));
const User_model_1 = __importDefault(require("../models/User.model"));
const cloudinary_1 = __importDefault(require("../libs/cloudinary/cloudinary"));
// Services 
const userService = new User_service_1.default();
const authService = new Auth_service_1.default();
const userController = {};
/**
 * SIGNUP
 */
userController.signup = async (req, res) => {
    try {
        const input = req.body;
        if (!input.userPassword || !input.userEmail || !input.username) {
            res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: Error_1.Message.INVALID_CREDENTIALS });
        }
        const candidate = await User_model_1.default.findOne({
            $or: [
                { username: input.username },
                { phone: input.userEmail }
            ]
        });
        if (candidate) {
            res.status(Error_1.HttpCode.BAD_REQUEST).json({ message: Error_1.Message.USED_USERNAME_PHONE });
        }
        const result = await userService.signup(input);
        // Create tokens
        const accessToken = await authService.createAccessToken(result);
        const refreshToken = await authService.createRefreshToken(result);
        // Store refresh token securely
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Access token can be sent directly
        res.status(Error_1.HttpCode.CREATED).json({
            user: result,
            accessToken
        });
    }
    catch (err) {
        console.log("Error, signup:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * LOGIN
 */
userController.login = async (req, res) => {
    try {
        const input = req.body;
        const result = await userService.login(input);
        // Generate tokens
        const accessToken = await authService.createAccessToken(result.user);
        const refreshToken = await authService.createRefreshToken(result.user);
        // Store refresh token in secure cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(Error_1.HttpCode.OK).json({
            user: result,
            accessToken
        });
    }
    catch (err) {
        console.log("Error, login:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * REFRESH TOKEN
 */
userController.refreshToken = async (req, res) => {
    try {
        console.log("refreshToken");
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.INVALID_TOKEN);
        }
        const { accessToken, refreshToken } = await authService.rotateTokens(token);
        // Update refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(Error_1.HttpCode.OK).json({ accessToken });
    }
    catch (err) {
        console.log("Error, refreshToken:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
userController.uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const file = req.files.file;
        // Find user to delete old image if exists
        const user = await User_model_1.default.findById(userId);
        if (user?.userImage?.public_id) {
            await cloudinary_1.default.uploader.destroy(user.userImage.public_id);
        }
        // Upload new image
        const result = await cloudinary_1.default.uploader.upload(file.tempFilePath, {
            folder: "profile_images",
        });
        // Save as object in userImage
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, {
            userImage: {
                url: result.secure_url,
                public_id: result.public_id,
            },
        }, { new: true });
        res.status(200).json(updatedUser);
    }
    catch (err) {
        console.log("Error in uploadImage:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
userController.deleteProfileImage = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find user
        const user = await User_model_1.default.findById(userId);
        if (!user) {
            return res.status(Error_1.HttpCode.NOT_FOUND).json({ error: Error_1.Message.NO_DATA_FOUND });
        }
        // Check if user has an image to delete
        if (!user.userImage?.public_id) {
            return res.status(Error_1.HttpCode.BAD_REQUEST).json({ error: Error_1.Message.NOT_UPLOADED });
        }
        // Delete image from Cloudinary
        await cloudinary_1.default.uploader.destroy(user.userImage.public_id);
        // Remove userImage object from DB
        user.userImage = undefined;
        await user.save();
        res.status(Error_1.HttpCode.OK).json({ message: Error_1.Message.DELETE_SUCCESS });
    }
    catch (err) {
        console.log("Error in deleteProfileImage:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * LOGOUT
 */
userController.logout = (req, res) => {
    try {
        console.log("logout");
        res.clearCookie("refreshToken");
        res.status(Error_1.HttpCode.OK).json({ logout: true });
    }
    catch (err) {
        console.log("Error, logout:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * GET MEMBER DETAILS
 */
userController.getUserDetails = async (req, res) => {
    try {
        console.log("getMemberDetails");
        const result = await userService.getUserDetails(req.user);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, getMemberDetails:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
userController.searchUser = async (req, res) => {
    try {
        const searchParam = req.query.search;
        const search = typeof searchParam === "string" ? searchParam : "";
        const result = await userService.searchUserByUsername(search);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, getMemberDetails:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
userController.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await userService.getUserById(userId);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, getUserById:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
userController.getAllUsers = async (req, res) => {
    try {
        const result = await userService.getAllUsers();
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, getAllUsers:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
exports.default = userController;
