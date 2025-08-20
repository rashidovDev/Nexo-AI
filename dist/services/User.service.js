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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Error_1 = __importStar(require("../libs/utils/Error"));
const user_enum_1 = require("../libs/enums/user.enum");
const config_1 = require("../libs/utils/config");
class UserService {
    constructor() {
        this.userModel = User_model_1.default;
    }
    /**
     * Sign up new member
     */
    /** SPA Signup */
    async signup(input) {
        const salt = await bcryptjs_1.default.genSalt();
        input.userPassword = await bcryptjs_1.default.hash(input.userPassword, salt);
        try {
            const result = await this.userModel.create(input);
            result.userPassword = ""; // Hide password before returning
            return result.toJSON();
        }
        catch (err) {
            console.log("Error , model:signup", err);
            throw new Error_1.default(Error_1.HttpCode.BAD_REQUEST, Error_1.Message.CREATION_FAILED);
        }
    }
    /**
     * Login existing member
     */
    /** SPA Login */
    async login(input) {
        // 1️⃣ Find user by nickname (and not deleted)
        const user = await this.userModel
            .findOne({
            username: input.username,
            memberStatus: { $ne: user_enum_1.UserStatus.DELETE },
        }, { username: 1, userPassword: 1, userStatus: 1 })
            .exec();
        if (!user) {
            throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_MEMBER_NICK);
        }
        else if (user.userStatus === user_enum_1.UserStatus.BLOCK) {
            throw new Error_1.default(Error_1.HttpCode.FORBIDDEN, Error_1.Message.BLOCKED_USER);
        }
        // 2️⃣ Check password
        const isMatch = await bcryptjs_1.default.compare(input.userPassword, user.userPassword);
        if (!isMatch) {
            throw new Error_1.default(Error_1.HttpCode.UNAUTHORIZED, Error_1.Message.WRONG_PASSWORD);
        }
        // 3️⃣ Fetch complete user data without password
        const foundMember = await this.userModel
            .findById(user._id)
            .select("username userType userStatus createdAt updatedAt")
            .exec();
        if (!foundMember) {
            throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_MEMBER_NICK);
        }
        console.log(foundMember);
        const safeUser = foundMember.toJSON();
        // 5️⃣ Return user & tokens
        return {
            user: safeUser,
        };
    }
    /**
     * Find member by ID
     */
    async getUserDetails(user) {
        const userId = (0, config_1.shapeIntoMongooseObjectId)(user._id);
        const result = await this.userModel.findOne({
            _id: userId,
            userStatus: user_enum_1.UserStatus.ACTIVE
        })
            .exec();
        if (!result)
            throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_DATA_FOUND);
        return result.toJSON();
    }
    async searchUserByUsername(payload) {
        const result = await this.userModel.findOne({
            username: { $regex: new RegExp(`^${payload}$`, "i") }, // case-insensitive match
            userStatus: user_enum_1.UserStatus.ACTIVE
        })
            .exec();
        if (!result)
            if (!result)
                throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_DATA_FOUND);
        return result.toJSON();
    }
    async getUserById(userId) {
        const result = await this.userModel.findById(userId)
            .select("username userImage userEmail userPhone")
            .exec();
        if (!result) {
            throw new Error_1.default(Error_1.HttpCode.NOT_FOUND, Error_1.Message.NO_DATA_FOUND);
        }
        return result.toJSON();
    }
    async getAllUsers() {
        const users = await this.userModel.find({ userStatus: user_enum_1.UserStatus.ACTIVE })
            .select("username userImage userEmail")
            .exec();
        return users.map(user => user.toJSON());
    }
}
exports.default = UserService;
