const nodemailer = require('nodemailer')
import OtpModel from '../models/Otp.model';
import bcrypt from 'bcrypt'
import BaseError from '../libs/utils/base.error';

class MailService {
	private transporter: any;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		})
	}

	async sendOtp(to : any) {
		const otp = Math.floor(100000 + Math.random() * 900000) // 6 digit otp

		const hashedOtp = await bcrypt.hash(otp.toString(), 10)
		await OtpModel.create({ email: to, otp: hashedOtp, expireAt: new Date(Date.now() + 5 * 60 * 1000) })
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to,
			subject: `OTP for verification ${new Date().toLocaleString()}`,
			html: `<h1>Your OTP is ${otp}</h1>`,
		})
	}

	async verifyOtp(email : string, otp : number | string) {
		const otpData = await OtpModel.find({ email })
		if (!otpData) throw BaseError.BadRequest('Otp not found')
		const currentOtp = otpData[otpData.length - 1]
		if (!currentOtp) throw BaseError.BadRequest('Otp not found')

		if (currentOtp.expireAt < new Date()) {
			throw BaseError.BadRequest('Your otp is expired')
		}

		const isValid = await bcrypt.compare(otp.toString(), currentOtp.otp)
		if (!isValid) throw BaseError.BadRequest('Invalid otp entered')

		await OtpModel.deleteMany({ email })
		return true
	}
}

export default MailService; 