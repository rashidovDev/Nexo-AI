import MessageModel from "../models/Message.model";
import ChatModel from "../models/Chat.model";
import Errors, { HttpCode, Message as ErrorMessage, Message } from "../libs/utils/Error";
import { Message as IMessage, MessageInput } from "../libs/types/message";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";

class MessageService {
  private readonly messageModel;
  private readonly chatModel;

  constructor() {
    this.messageModel = MessageModel;
    this.chatModel = ChatModel;
  }

  /**
   * Get all messages in a chat
   */
  public async getMessages(chatId: string): Promise<IMessage[]> {
    try {
      const messages: IMessage[] = await this.messageModel
        .find({ chat: chatId 
          
        })
        .populate("sender", "username userImage")
        .populate("readBy.user", "username userImage")
        .sort({ createdAt: 1 });

      return messages.map((m) => m.toJSON() as unknown as IMessage);
    } catch (err) {
      console.error("Error: getMessages", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }
  }

  /**
   * Send a message to a chat
   */
  public async sendMessage(input: MessageInput): Promise<IMessage> {
    try {
      const { chat, sender, text, attachments, receiver } = input;
      
      const message = await this.messageModel.create({
        chat,
        sender,
        text,
        attachments,
        receiver,
        readBy: [{ user: sender, at: new Date() }],
      });

      // update chat with lastMessage
      await this.chatModel.findByIdAndUpdate(chat, { lastMessage: message._id });

      await message.populate("sender", "username userImage");

      return message.toJSON() as unknown as IMessage;
    } catch (err) {
      console.error("Error: sendMessage", err);
      throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.CREATION_FAILED);
    }
  }

  /**
   * Mark message as read by a user
   */
  public async markAsRead(messageId: string, userId: string): Promise<IMessage> {
    try {
      const message = await this.messageModel.findByIdAndUpdate(
        messageId,
        {
          $addToSet: { readBy: { user: userId, at: new Date() } },
        },
        { new: true }
      )
      .populate("sender", "username userImage")
      .populate("readBy.user", "username userImage");

      if (!message) {
        throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
      }

      return message.toJSON() as unknown as IMessage;
    } catch (err) {
      console.error("Error: markAsRead", err);
      throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
    }
  }
}

export default MessageService;
