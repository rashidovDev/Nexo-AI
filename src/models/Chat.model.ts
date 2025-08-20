import { Chat as IChat } from "@/libs/types/chat";
import mongoose, { Schema, model, } from "mongoose";

const chatSchema = new Schema<IChat>({
  name: { type: String },
  isGroup: { type: Boolean, default: false },
  participants: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });

chatSchema.index({ participants: 1 });

export default mongoose.model<IChat>("Chat", chatSchema);