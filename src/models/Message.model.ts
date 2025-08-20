import { Message as IMessage  } from "@/libs/types/message";
import { Schema, model, Types, Document } from "mongoose";

const MessageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  attachments: [{ url: String, type: String }],
  receiver: [{ type: Schema.Types.ObjectId, ref: "User" }],
  readBy: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, at: Date }],
}, { timestamps: true });

MessageSchema.index({ chat: 1, createdAt: -1 });

export default model<IMessage>("Message", MessageSchema);
