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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const user_enum_1 = require("../libs/enums/user.enum");
// Schema first and Code first
const userSchema = new mongoose_1.Schema({
    userType: {
        type: String,
        enum: user_enum_1.UserType,
        default: user_enum_1.UserType.USER
    },
    userStatus: {
        type: String,
        enum: user_enum_1.UserStatus,
        default: user_enum_1.UserStatus.ACTIVE
    },
    userEmail: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },
    username: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },
    userPassword: {
        type: String,
        select: false,
        required: true,
    },
    userImage: {
        url: String,
        public_id: String
    },
    lastSeen: { type: Date },
}, { timestamps: true } // updateAt createAt
);
exports.default = mongoose_1.default.model("User", userSchema);
