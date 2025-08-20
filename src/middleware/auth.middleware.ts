import { ExtendedRequest, User } from "@/libs/types/user"
import { Request, Response, NextFunction } from "express"

const jwt = require("jsonwebtoken")
require('dotenv').config()

module.exports = (req: ExtendedRequest, res: Response, next : NextFunction) => {
    if(req.method === "OPTIONS"){
        return next() 
    }
    try{
        const authHeader = req.headers['authorization'] as string | undefined
        if(!authHeader?.startsWith("Bearer ")) return res.sendStatus(401)
        const token = authHeader.split(' ')[1]
        // console.log("token:", token)
        if(!token){
            return res.status(401).json({ message : "Auth error"})
        }
        const decoded : User = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded
        // console.log("decoded:", decoded)
        if(decoded.userType !== "USER"){
        return res.status(404).json({ message : "Auth error"})
        }
        next()
    }catch(e){
        return res.status(401).json({ message : "Auth error"}) 
    }
}