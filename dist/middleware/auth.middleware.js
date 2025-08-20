"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
require('dotenv').config();
module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader?.startsWith("Bearer "))
            return res.sendStatus(401);
        const token = authHeader.split(' ')[1];
        // console.log("token:", token)
        if (!token) {
            return res.status(401).json({ message: "Auth error" });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        // console.log("decoded:", decoded)
        if (decoded.userType !== "USER") {
            return res.status(404).json({ message: "Auth error" });
        }
        next();
    }
    catch (e) {
        return res.status(401).json({ message: "Auth error" });
    }
};
