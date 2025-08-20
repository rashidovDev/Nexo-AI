import { Document, Types } from "mongoose";

export interface Chat extends Document {
  name?: string;           // for group chats
  isGroup: boolean;
  participants: Types.ObjectId[]; // users
  admins: Types.ObjectId[];       // subset of participants (for groups)
  lastMessage?: Types.ObjectId;   // ref Message
}