import MessageModel from "../models/Message.model";
import ChatModel from "../models/Chat.model";
import UserModel from "../models/User.model";
import Errors, { HttpCode, Message as ErrorMessage, Message } from "../libs/utils/Error";
import { Message as IMessage, MessageInput } from "../libs/types/message";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";
import { Types } from "mongoose";
import {MessageEnum} from "../libs/enums/message.enum"

class MessageService {
  private readonly messageModel;
  private readonly chatModel;
  private readonly userModel

  constructor() {
    this.messageModel = MessageModel;
    this.chatModel = ChatModel;
    this.userModel = UserModel
  }

  /**
   * Get all messages in a chat
   */
  public async getMessages(chatId: string, userId: string): Promise<IMessage[]> {
    try {
      const now = new Date();

      const messages: IMessage[] = await this.messageModel
        .find({ chat: chatId })
        // .populate("sender", "username userImage")
        // .populate("readBy.user", "username userImage")
        .sort({ createdAt: 1});
      
      await this.messageModel.updateMany(
      {
        chat: chatId,
        "readBy.user": { $ne: userId } // user not in readBy array
      },
      {
        status : MessageEnum.READ,
        $addToSet: {
          readBy: { user: userId, at: now }
        }
      }
    );

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
      console.log("Input to sendMessage:", input);
      const message = await this.messageModel.create({
        ...input,
      
        readBy: [{ user: input?.sender, at: new Date() }],
      });

      // update chat with lastMessage
      await this.chatModel.findByIdAndUpdate(input?.chat, { lastMessage: message._id });
      return message.toJSON() as unknown as IMessage;
    } catch (err) {
      console.error("Error: sendMessage", err);
      throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.CREATION_FAILED);
    }
  }

  /**
   * Mark message as read by a user
   */
public async markChatRead(chatId: string, userId: string) {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // Update all messages from this chat where user has NOT read them
    const result = await this.messageModel.updateMany(
      {
        chat: chatId,
        "readBy.user": { $ne: userId } // user not in readBy array
      },
      {
        status : MessageEnum.READ,
        $addToSet: {
          readBy: { user: userObjectId, at: now }
        }
      }
    );

    return result.modifiedCount; // number of messages marked as read

  } catch (err) {
    console.error("Error: markChatRead", err);
    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
  }
}

public async messageRead(messages : IMessage[]) {
  try {
    // const userObjectId = new Types.ObjectId(userId);
    // const now = new Date();
  const allMessages = []

		for (const message of messages) {
				const updatedMessage = await this.messageModel.findByIdAndUpdate(message._id, { status: MessageEnum.READ }, { new: true })
				allMessages.push(updatedMessage)
			}

      return allMessages

  } catch (err) {
    console.error("Error: markChatRead", err);
    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
  }
}

}

export default MessageService;
