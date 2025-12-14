import bcrypt from "bcryptjs";
import ChatModel from "../models/Chat.model";
import Errors, { HttpCode, Message } from "../libs/utils/Error";
import { LoginInput, User, UserInput } from "../libs/types/user";
import { UserStatus } from "../libs/enums/user.enum";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";
import { Chat } from "@/libs/types/chat";

class ChatService {
  private readonly chatModel;
   constructor() {
    this.chatModel = ChatModel
  }

   public async getMyChats(userId : string): Promise<Chat[]> {
    try {
    const chats : Chat[] = await this.chatModel.find({ participants: userId })
      .populate("participants", "email username userImage bio firstName lastName")
      .populate({
        path: "lastMessage",
      })
      .sort({ updatedAt: -1 });
      return chats.map(chat => chat.toJSON() as unknown as Chat);
    } catch (err) {
      console.log("Error , model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  public async getOrCreateDM(userId: string, otherId: string): Promise<Chat> {
    if (userId === otherId) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CANNOT_DM_SELF);
    }

    let chat = await this.chatModel.findOne({
      isGroup: false,
      participants: { $all: [userId, otherId], $size: 2 },
    });

    if (!chat) {
      chat = await this.chatModel.create({
        isGroup: false,
        participants: [userId, otherId],
      });
    }

    await chat.populate("participants", "username userImage");
    return chat.toJSON() as unknown as Chat;
  }

  public async createGroup(userId: string, name: string, participantIds: string[]): Promise<Chat> {
    // ensure creator is part of the group
    const participants = Array.from(new Set([userId, ...participantIds]));

    const chat = await this.chatModel.create({
      isGroup: true,
      name,
      participants,
      admins: [userId],
    });

    await chat.populate("participants", "username userImage");

    return chat.toJSON() as unknown as Chat;
  }

  


}

export default ChatService;