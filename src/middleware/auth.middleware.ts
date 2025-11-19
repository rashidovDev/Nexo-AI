import { ExtendedRequest, User } from "@/libs/types/user"
import { Request, Response, NextFunction } from "express"
import UserModel from "../models/User.model"

const jwt = require("jsonwebtoken")
require('dotenv').config()

module.exports = async (req: ExtendedRequest, res: Response, next : NextFunction) => {
    if(req.method === "OPTIONS"){
        return next() 
    }
    try{
        const authHeader = req.headers['authorization'] as string | undefined
        if(!authHeader?.startsWith("Bearer ")) return res.sendStatus(401)
        const token = authHeader.split(' ')[1]
        console.log("token:", token)
        if(!token){
            return res.status(401).json({ message : "Auth error"})
        }
        const { userId} = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET)
        // console.log("userId from token:", userId)

       if (!userId) {
			return  res.status(401).json({ message: "Unauthorized" });
		}
        // console.log("decoded:", decoded)
        const user = await UserModel.findById({_id : userId})
        // console.log("Authenticated user:", user)
        if(!user){
            return res.status(401).json({ message : "User not found"}) 
        }
        req.user = user as unknown as User
        next()
    }catch(e){
        return res.status(401).json({ message : "Auth error"}) 
    }
}