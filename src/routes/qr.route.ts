import { Router } from "express"
import qrController from "../controllers/qr.controller"
const authMiddleware = require("../middleware/auth.middleware")

const router = Router()

// Browser -> create QR
router.post("/create", qrController.create)

// Mobile -> approve QR (must be logged in)
router.post("/approve", authMiddleware, qrController.approve)

// Browser -> check QR status
router.get("/status", qrController.status)

export default router