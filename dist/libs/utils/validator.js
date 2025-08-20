"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markReadSchema = exports.sendMessageSchema = exports.createGroupSchema = exports.createDMOrGetSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(32),
    userEmail: zod_1.z.string().email(),
    userPassword: zod_1.z.string().min(6).max(128),
    userPhone: zod_1.z.string(),
    userImage: zod_1.z.string(),
});
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.createDMOrGetSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1), // other user id
});
exports.createGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    participantIds: zod_1.z.array(zod_1.z.string()).min(2),
});
exports.sendMessageSchema = zod_1.z.object({
    chat: zod_1.z.string().optional(), // DM creation can skip this
    text: zod_1.z.string().optional(),
    receiver: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    // attachments: z
    //   .array(
    //     z.object({
    //       url: z.string().url(),
    //       type: z.string().optional(),
    //     })
    //   )
    //   .optional(),
});
exports.markReadSchema = zod_1.z.object({
    messageId: zod_1.z.string().min(1, "Message ID required"),
});
