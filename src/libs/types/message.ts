import { Document, Types, ObjectId } from "mongoose";


export interface Message extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
    reactions: {
    reaction: string;                        // emoji or reaction type
    user: string;                            // userId (ObjectId as string)
  }[];
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
  _id: string;
  text: string;
  image: string;

  reactions: {
    reaction: string;                        // emoji or reaction type
    user: string;                            // userId (ObjectId as string)
  }[];

  sender: string;
  receiver: string;
  
  createdAt: string;
  updatedAt: string;
  status: string;
}

