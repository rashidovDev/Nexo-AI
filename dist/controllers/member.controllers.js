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
const Member_service_1 = __importDefault(require("../models/Member.service"));
const Error_1 = __importStar(require("../libs/utils/Error"));
const Auth_service_1 = __importDefault(require("../models/Auth.service"));
// Services
const memberService = new Member_service_1.default();
const authService = new Auth_service_1.default();
const memberController = {};
/**
 * SIGNUP
 */
memberController.signup = async (req, res) => {
    try {
        console.log("signup");
        const input = req.body;
        const result = await memberService.signup(input);
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
            member: result,
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
memberController.login = async (req, res) => {
    try {
        console.log("login");
        const input = req.body;
        const result = await memberService.login(input);
        // Generate tokens
        const accessToken = await authService.createAccessToken(result);
        const refreshToken = await authService.createRefreshToken(result);
        // Store refresh token in secure cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(Error_1.HttpCode.OK).json({
            member: result,
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
memberController.refreshToken = async (req, res) => {
    try {
        console.log("refreshToken");
        const token = req.cookies.refreshToken;
        if (!token) {
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.REFRESH_TOKEN_MISSING);
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
/**
 * LOGOUT
 */
memberController.logout = (req, res) => {
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
memberController.getMemberDetails = async (req, res) => {
    try {
        console.log("getMemberDetails");
        const result = await memberService.getMemberDetails(req.member);
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
/**
 * UPDATE MEMBER
 */
memberController.updateMember = async (req, res) => {
    try {
        console.log("updateMember");
        const input = req.body;
        if (req.file)
            input.memberImage = req.file.path.replace(/\\/, "/");
        const result = await memberService.updateMember(req.member, input);
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, updateMember:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * GET TOP USERS
 */
memberController.getTopUsers = async (req, res) => {
    try {
        console.log("getTopUsers");
        const result = await memberService.getTopUsers();
        res.status(Error_1.HttpCode.OK).json(result);
    }
    catch (err) {
        console.log("Error, getTopUsers:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * VERIFY AUTH (Protected route middleware)
 */
memberController.verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Bearer token
        if (token)
            req.member = await authService.verifyAccessToken(token);
        if (!req.member)
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.NOT_AUTHENTICATED);
        next();
    }
    catch (err) {
        console.log("Error, verifyAuth:", err);
        if (err instanceof Error_1.default)
            res.status(err.code).json(err);
        else
            res.status(Error_1.default.standard.code).json(Error_1.default.standard);
    }
};
/**
 * RETRIEVE AUTH (Optional auth middleware)
 */
memberController.retrieveAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token)
            req.member = await authService.verifyAccessToken(token);
        next();
    }
    catch {
        next();
    }
};
exports.default = memberController;
