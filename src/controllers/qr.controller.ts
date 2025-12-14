import crypto from "crypto"
import { commonObject } from "@/libs/types/common"
import { ExtendedRequest } from "@/libs/types/user"
import { HttpCode } from "../libs/utils/Error"
import QrLoginModel from "../models/QrLogin.model"
import { NextFunction, Request, Response } from "express"

const qrController: commonObject = {}

qrController.create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const qrId = crypto.randomUUID()

    await QrLoginModel.create({
      qrId, 
      expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
    })

    return res.status(HttpCode.CREATED).json({ qrId })
  } catch (error) {
    next(error)
  }
}

qrController.approve = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { qrId } = req.body
    const userId = req.user?._id   // SAFE access

    if (!qrId || !userId) {
      return res.status(400).json({ message: "Invalid request" })
    }

    const session = await QrLoginModel.findOne({
      qrId,
      status: 'PENDING'
    })

    if (!session) {
      return res.status(400).json({ message: 'QR expired or invalid' })
    }

    session.userId = userId
    session.status = 'APPROVED'
    await session.save()

    return res.status(HttpCode.OK).json({
      message: 'QR login approved'
    })
  } catch (error) {
    next(error)
  }
}

qrController.status = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const qrId = req.query.qrId as string

    if (!qrId) {
      return res.status(400).json({ message: "qrId required" })
    }

    const session = await QrLoginModel.findOne({ qrId })

    if (!session) {
      return res.status(404).json({ status: 'EXPIRED' })
    }

    return res.status(HttpCode.OK).json({
      status: session.status,
      userId: session.userId
    })
  } catch (error) {
    next(error)
  }
}

export default qrController
