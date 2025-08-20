import { Request, Response } from "express";
// import {User}  from "../models/User.model";
import { createDMOrGetSchema, createGroupSchema } from "../libs/utils/validator";
import ChatService from "../services/Chat.service";
import { Chat } from "../libs/types/chat";
import Errors, { HttpCode } from "../libs/utils/Error";

import { commonObject } from "../libs/types/common";

const chatService = new ChatService();

const chatController : commonObject = {};

chatController.listMyChats = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  try{
    const result : Chat[] = await chatService.getMyChats(userId);
    res.status(HttpCode.OK).json(result);
  }catch (err) {
    if(err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
}
};

chatController.getOrCreateDM = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  const parsed = createDMOrGetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(HttpCode.BAD_REQUEST).json({message : parsed.error.message});
  const otherId = parsed.data.userId;
  try {
    const result:Chat = await chatService.getOrCreateDM(userId, otherId);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if(err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
}}

chatController.createGroup = async (req: Request, res: Response) => {
  const userId = (req as any).user._id as string;
  const parsed = createGroupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { name, participantIds} = parsed.data;

    try {
        const result: Chat = await chatService.createGroup(userId, name, participantIds);
        res.status(HttpCode.CREATED).json(result);
    } catch (err) {
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default chatController 
