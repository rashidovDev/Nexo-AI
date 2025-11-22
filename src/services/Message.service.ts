import MessageModel from "../models/Message.model";
import ChatModel from "../models/Chat.model";
import UserModel from "../models/User.model";
import Errors, { HttpCode, Message as ErrorMessage, Message } from "../libs/utils/Error";
import { Message as IMessage, MessageInput } from "../libs/types/message";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";
import { Types } from "mongoose";
import {MessageEnum} from "../libs/enums/message.enum"
import { Chat } from "@/libs/types/chat";

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
  public async sendMessage(input: MessageInput): Promise<IMessage & { chat: Chat }> {
  try {
    console.log("Input to sendMessage:", input);

    // 1. Create the message
    const message = await this.messageModel.create({
      ...input,
      readBy: [{ user: input.sender, at: new Date() }],
    });

    // 2. Update the chat with lastMessage
    await this.chatModel.findByIdAndUpdate(input.chat, { lastMessage: message._id });

    // 3. Populate the chat
    const populatedMessage = await this.messageModel
      .findById(message._id)
      .populate({
        path: "chat",
        populate: { path: "participants admins", select: "_id name email userImage" }, // populate nested fields
      }).
      populate({
        path: "chat",
        populate: { path: "lastMessage"}
      })
      .exec();

    return populatedMessage as unknown as IMessage & { chat: Chat };
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

public async addReaction(messageId: string, userId: string, reaction: string) {
  try {
    // 1. Remove old reaction from this user
    await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: { reactions: { user: userId } }
      }
    );

    // 2. Add the new reaction
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $push: { reactions: { user: userId, reaction } }
      },
      { new: true }
    ).populate("reactions.user", "userImage firstName lastName");

    if (!updatedMessage) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
    }

    return updatedMessage;

  } catch (err) {
    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
  }
}


public async removeReaction(messageId: string, userId: string) {
  try {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: { reactions: { user: userId } }
      },
      { new: true }
    );

    if (!updatedMessage) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
    }

    return updatedMessage;

  } catch (err) {
    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
  }
}

public async deleteMessage(messageId: string) {
  try {
    const deletedMessage = await this.messageModel.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
    }

    return deletedMessage;
  } catch (err) {
    // if it's already a custom error, rethrow it
    if (err instanceof Errors) {
      throw err;
    }

    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.DELETE_FAILED);
  }
}

public async updateMessage(messageId: string, text: string) {
  try {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(messageId, {text}, { new: true });

    if (!updatedMessage) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
    }

    return updatedMessage;
  } catch (err) {
    // if it's already a custom error, rethrow it
    if (err instanceof Errors) {
      throw err;
    }

    throw new Errors(HttpCode.BAD_REQUEST, ErrorMessage.UPDATE_FAILED);
  }
}



}

export default MessageService;
