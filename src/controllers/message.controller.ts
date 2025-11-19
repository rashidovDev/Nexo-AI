import { Request, Response } from "express";
import MessageService from "../services/Message.service";
import Errors, { HttpCode } from "../libs/utils/Error";
import { Message as IMessage } from "../libs/types/message";
import { sendMessageSchema, markReadSchema } from "../libs/utils/validator";
import ChatService from "../services/Chat.service";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";
import { commonObject } from "../libs/types/common";
import UserService from "@/services/User.service";
import UserModel from "../models/User.model";

const messageService = new MessageService();
const chatService = new ChatService();

const messageController : commonObject = {};
/**
 * Get all messages in a chat
 */
messageController.getMessages = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  const chatId = req.params.chatId;
  try {
    const result: IMessage[] = await messageService.getMessages(chatId, userId);
    res.status(HttpCode.OK).json({messages : result});
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * Send a message in a chat
 */
messageController.sendMessage = async (req: Request, res: Response) => {
  const sender = (req as any).user._id as string;
  console.log("Data", req.body)
  const parsed = sendMessageSchema.safeParse(req.body);
  // console.log("Parsed message data:", parsed);

  if (!parsed.success) {
    return res.status(HttpCode.BAD_REQUEST).json({ message: parsed.error.message });
  }
const receiver = Array.isArray(parsed.data.receiver)
  ? parsed.data.receiver[0] // take first for DM
  : parsed.data.receiver;
  if (!receiver) {
    return res.status(HttpCode.BAD_REQUEST).json({ message: "Receiver is required." });
  } 
  try {
   let chatId = parsed.data.chat 
    ? shapeIntoMongooseObjectId(parsed.data.chat) 
    : null;
    // console.log("Parsed chat ID:", chatId);
    // Ensure DM chat exists
    if(!chatId) {
        const existingChat = await chatService.getOrCreateDM(sender, receiver);
        chatId = shapeIntoMongooseObjectId(existingChat._id);
    }
    // Send message
    const result: IMessage = await messageService.sendMessage({
      chat: chatId, // <-- important fix // pass only the ID
      sender,
      ...req.body,
    });

    const receiverUser = await UserModel.findById(result.receiver)
    const senderUser = await UserModel.findById(result.sender)

    res.status(HttpCode.CREATED).json({message : result, sender : senderUser, receiver : receiverUser});
  } catch (err) {
    console.error("Error sending DM:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * Mark a message as read
 */
messageController.markChatRead = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  const { chatId } = req.body;
  try {
    const result = await messageService.markChatRead(chatId, userId);
    res.status(200).json({ updated: result });
  } catch (err: any) {
    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

messageController.markMessageRead = async (req: Request, res: Response) => {
  // const userId = (req as any).user._id as string;
  const { messages } = req.body;
  try {
    const result = await messageService.messageRead(messages);
    res.status(200).json({ messages: result });
  } catch (err: any) {
    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default messageController
