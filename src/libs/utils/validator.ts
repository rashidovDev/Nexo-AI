import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  userEmail: z.string().email(),
  userPassword: z.string().min(6).max(128),
  userPhone: z.string(),
  userImage: z.string(),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
}); 

export const createDMOrGetSchema = z.object({
  userId: z.string().min(1), // other user id
});

export const createGroupSchema = z.object({
  name: z.string().min(1),
  participantIds: z.array(z.string()).min(2),
});

export const sendMessageSchema = z.object({
  chat: z.string().optional(), // DM creation can skip this
  text: z.string().optional(),
  receiver: z.union([z.string(), z.array(z.string())]).optional(),
  // attachments: z
  //   .array(
  //     z.object({
  //       url: z.string().url(),
  //       type: z.string().optional(),
  //     })
  //   )
  //   .optional(),
});

export const markReadSchema = z.object({
  messageId: z.string().min(1, "Message ID required"),
});