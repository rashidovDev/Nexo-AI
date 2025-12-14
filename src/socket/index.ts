import { Server, Socket } from "socket.io";

interface IUser {
  _id: string;
  muted?: boolean;
}

interface IMessage {
  _id: string;
  [key: string]: unknown;
}

interface OnlineUser {
  user: IUser;
  socketId: string;
}

interface SendMessagePayload {
  message: IMessage;
  receiver: IUser | string | null;
  sender: IUser;
}

interface NewContactPayload {
  currentUser: IUser;
  receiver: IUser;
}

interface MessageReadPayload {
  messages: IMessage[];
  receiver: IUser;
}

interface UpdateMessagePayload {
  updatedMessage: IMessage;
  receiver: IUser;
  sender: IUser;
}

interface DeleteMessagePayload {
  deletedMessage: IMessage;
  receiver: IUser;
  sender: IUser;
  filteredMessages: IMessage[];
}

interface TypingPayload {
  receiver: IUser;
  sender: IUser;
  message: string;
}

let users: OnlineUser[] = [];

const addOnlineUser = (user: IUser, socketId: string) => {
  const index = users.findIndex(u => u.user._id === user._id);
  if (index !== -1) {
    users[index].socketId = socketId;
  } else {
    users.push({ user, socketId });
  }
};

const getSocketId = (userId?: string | null) => {
  if (!userId) return null;
  const user = users.find(u => u.user._id === userId);
  return user ? user.socketId : null;
};

const resolveUserId = (user?: IUser | string | null) => {
  if (!user) return null;
  return typeof user === "string" ? user : user._id;
};

const emitToUser = (
  socket: Socket,
  targetUser: IUser | string | null | undefined,
  event: string,
  payload: unknown
) => {
  const userId = resolveUserId(targetUser);
  const socketId = getSocketId(userId);
  if (socketId) {
    socket.to(socketId).emit(event, payload);
  }
};

export const initSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("addOnlineUser", (user: IUser) => {
      addOnlineUser(user, socket.id);
      io.emit("getOnlineUsers", users);
    });

    socket.on("newContact", ({ currentUser, receiver }: NewContactPayload) => {
      emitToUser(socket, receiver, "getNewContact", currentUser);
    });

    socket.on("sendMessage", ({ message, receiver, sender }: SendMessagePayload) => {
      emitToUser(socket, receiver, "getNewMessage", { message, receiver, sender });
    });

    socket.on("newChatCreated", ({ message, receiver }: { message: IMessage; receiver: IUser }) => {
      emitToUser(socket, receiver, "getNewChatCreated", { message, receiver });
    });

    socket.on("messageRead", ({ messages, receiver }: MessageReadPayload) => {
      emitToUser(socket, receiver, "messagesReadByReceiver", messages);
    });

    socket.on("updateMessage", ({ updatedMessage, receiver, sender }: UpdateMessagePayload) => {
      emitToUser(socket, receiver, "getUpdatedMessage", { updatedMessage, receiver, sender });
    });

    socket.on(
      "deleteMessage",
      ({ deletedMessage, receiver, sender, filteredMessages }: DeleteMessagePayload) => {
        emitToUser(socket, receiver, "getDeletedMessage", {
          deletedMessage,
          receiver,
          sender,
          filteredMessages,
        });
      }
    );

    socket.on("typing", ({ receiver, sender, message }: TypingPayload) => {
      emitToUser(socket, receiver, "getTypingMessage", { message, sender, receiver });
    });

    socket.on("disconnect", () => {
      users = users.filter(u => u.socketId !== socket.id);
      io.emit("getOnlineUsers", users);
      console.log("User disconnected:", socket.id);
    });
  });
};
