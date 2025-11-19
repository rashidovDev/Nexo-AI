import { Document, Types, ObjectId } from "mongoose";


export interface Message extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  reaction?: string;
  status?: "sent" | "delivered" | "read";
  image?: {url: string};
  receiver: Types.ObjectId[]; // users who received
  readBy: { user: Types.ObjectId; at: Date }[];
}

export interface MessageInput {
  chat: string; // Chat ID where the message belongs
  sender: string; // User ID of sender
  text?: string; // Optional text content
  image? : string;
  reaction?: string;
  receiver?: string[] | string; // For DM or targeted recipients in a group
}


export interface IMessage {
  _id: string
  text: string
  image: string
  reaction: string
    sender:  string | ObjectId
  receiver: string | ObjectId
  createdAt: string
  updatedAt: string
  status: string
}


