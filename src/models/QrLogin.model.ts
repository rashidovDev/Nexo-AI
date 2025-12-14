import mongoose from "mongoose"

const QrLoginSchema = new mongoose.Schema({
  qrId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ['PENDING', 'APPROVED'], default: 'PENDING' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true })

QrLoginSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.QrLogin || mongoose.model("QrLogin", QrLoginSchema)