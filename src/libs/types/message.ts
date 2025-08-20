import { Document, Types } from "mongoose";

export interface Message extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  attachments?: { url: string; type?: string }[];
  receiver: Types.ObjectId[]; // users who received
  readBy: { user: Types.ObjectId; at: Date }[];
}
export interface MessageInput {
  chat: string; // Chat ID where the message belongs
  sender: string; // User ID of sender
  text?: string; // Optional text content
  attachments?: { url: string; type: string }[]; // Optional files (image, video, etc.)
  receiver?: string[] | string; // For DM or targeted recipients in a group
}


