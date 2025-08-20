import { Request, Response } from "express";
import MessageService from "../services/Message.service";
import Errors, { HttpCode } from "../libs/utils/Error";
import { Message as IMessage } from "../libs/types/message";
import { sendMessageSchema, markReadSchema } from "../libs/utils/validator";
import ChatService from "../services/Chat.service";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";
import { commonObject } from "../libs/types/common";

const messageService = new MessageService();
const chatService = new ChatService();

const messageController : commonObject = {};
/**
 * Get all messages in a chat
 */
messageController.getMessages = async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  try {
    const result: IMessage[] = await messageService.getMessages(chatId);
    res.status(HttpCode.OK).json(result);
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
  const parsed = sendMessageSchema.safeParse(req.body);
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
    console.log("Parsed chat ID:", chatId);
    // Ensure DM chat exists
    if(!parsed.data.chat){
        const existingChat = await chatService.getOrCreateDM(sender, receiver);
        chatId = shapeIntoMongooseObjectId(existingChat._id);
    }
    // Send message
    const result: IMessage = await messageService.sendMessage({
      chat: chatId, // <-- important fix // pass only the ID
      sender,
      text: parsed.data.text,
    //   attachments: parsed.data.attachments?.map(att => ({
    //     url: att.url,
    //     type: att.type ?? "unknown"
    //   })),
      receiver: parsed.data.receiver,
    });

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.error("Error sending DM:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/**
 * Mark a message as read
 */
messageController.markMessageAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  const parsed = markReadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(HttpCode.BAD_REQUEST).json({ message: parsed.error.message });
  }

  const { messageId } = parsed.data;

  try {
    const result: IMessage = await messageService.markAsRead(messageId, userId);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default messageController
