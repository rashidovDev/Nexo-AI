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
const Error_1 = __importStar(require("../libs/utils/Error"));
const config_1 = require("../libs/utils/config"); // Example: 1h
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor() {
        this.accessSecret = process.env.ACCESS_TOKEN_SECRET;
        this.refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    }
    /**
     * Create Access Token
     */
    async createAccessToken(payload) {
        return new Promise((resolve, reject) => {
            const duration = `${config_1.TOKEN_TIME}h`;
            jsonwebtoken_1.default.sign(payload, this.accessSecret, { expiresIn: duration }, (err, token) => {
                if (err) {
                    reject(new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.TOKEN_CREATION_FAILED));
                }
                else {
                    resolve(token);
                }
            });
        });
    }
    /**
     * Create Refresh Token
     */
    async createRefreshToken(payload) {
        return new Promise((resolve, reject) => {
            const duration = `${config_1.TOKEN_TIME}d`;
            jsonwebtoken_1.default.sign(payload, this.refreshSecret, { expiresIn: duration }, (err, token) => {
                if (err) {
                    reject(new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.TOKEN_CREATION_FAILED));
                }
                else {
                    resolve(token);
                }
            });
        });
    }
    /**
     * Verify Access Token
     */
    async verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.accessSecret);
            console.log(`---[ACCESS] memberNick: ${decoded.username}---`);
            return decoded;
        }
        catch (err) {
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.INVALID_TOKEN);
        }
    }
    /**
     * Verify Refresh Token
     */
    async verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.refreshSecret);
            console.log(`---[REFRESH] memberNick: ${decoded.userPhone}---`);
            return decoded;
        }
        catch (err) {
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.INVALID_REFRESH_TOKEN);
        }
    }
    /**
     * Rotate Tokens (Generate new Access using Refresh)
     */
    async rotateTokens(refreshToken) {
        const decoded = await this.verifyRefreshToken(refreshToken);
        const newAccessToken = await this.createAccessToken(decoded);
        const newRefreshToken = await this.createRefreshToken(decoded);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
exports.default = AuthService;
