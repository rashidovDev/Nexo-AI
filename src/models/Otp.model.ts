
import { Otp } from "../libs/types/otp";
import { Schema, model, Types, Document } from "mongoose";

const OtpSchema = new Schema<Otp>({
 email: { type: String, required: true, index: true },
 otp: { type: String, required: true }, 
expireAt: {  type: Date, }
});

OtpSchema.index({ chat: 1, createdAt: -1 });

export default model<Otp>("Otp", OtpSchema);
