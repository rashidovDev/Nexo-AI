import { MessageEnum } from "../libs/enums/message.enum";
import { Message as IMessage  } from "@/libs/types/message";
import { Schema, model, Types, Document } from "mongoose";

const MessageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
reactions: [
  {
    reaction: { type: String },  // the emoji or reaction type
    user: { type: Schema.Types.ObjectId, ref: "User" } // who reacted
  }
],
  status: { type: String, enum: [MessageEnum.DELIVERED, MessageEnum.READ, MessageEnum.SENT], default: MessageEnum.SENT },
  image: { type: String},
  receiver: [{ type: Schema.Types.ObjectId, ref: "User" }],
  readBy: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, at: Date }],
}, { timestamps: true });

MessageSchema.index({ chat: 1, createdAt: -1 }); 

export default model<IMessage>("Message", MessageSchema);
