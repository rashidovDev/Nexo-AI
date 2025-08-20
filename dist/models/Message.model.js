"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    chat: { type: mongoose_1.Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    attachments: [{ url: String, type: String }],
    receiver: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" }, at: Date }],
}, { timestamps: true });
MessageSchema.index({ chat: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)("Message", MessageSchema);
