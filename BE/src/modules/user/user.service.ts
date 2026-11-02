import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../models/user/user.repository";
import { LoginDTO, RegisterDTO, SendOtpDTO } from "./user.dto";
import { AuthFactoryService } from "./factory";
import { AuthorityError, BadRequestError, ConflictError, NotFoundError } from "../../utils/common/Error";
import { comparePassword, hashing } from "../../utils/hashing";
import { sendEmail } from "../../utils/email";
import { generateExpiryDate, generateOtp } from "../../utils/otp";
import { devConfig } from "../../config/dev.env";
import { generateToken } from "../../utils/token";
import { OtpRecord } from "../../utils/common/interfaces";

class UserService {
    private userRepository = new UserRepository();
    private authRepository = new AuthFactoryService();
    private otpCache: Record<string, OtpRecord> = {};
    constructor() { }
    public getProfile = async (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: "done successfully", success: true });
    }
    register = async (req: Request, res: Response, next: NextFunction) => {
        const registerDTO: RegisterDTO = req.body;
        const userExistance = await this.userRepository.exist({ email: registerDTO.email });
        if (userExistance) {
            throw new ConflictError("User already Exist");
        }
        const user = await this.authRepository.register(registerDTO);
        const createdUser = await this.userRepository.create(user);
        
        res.
            status(201).
            json({ message: "User created successfully", success: true, data: createdUser});
    }
    login = async (req: Request, res: Response, next: NextFunction) => {
        const loginDTO: LoginDTO = req.body;
        if (!loginDTO.email || !loginDTO.password) {
            throw new ConflictError("Email and password are required");
        }
        const user = await this.userRepository.exist({ email: loginDTO.email });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const isPasswordValid = await comparePassword(loginDTO.password, user.password);
        if (!isPasswordValid) {
            throw new AuthorityError("Invalid credentials");
        }
        const accessToken = generateToken({ email: user.email, name: user.name }, undefined,
            { expiresIn: "59m" });
        res
            .status(200)
            .json({ message: "Login successful", success: true, data: user, token: accessToken });
    }
    public sendOtp = async (req: Request, res: Response) => {
        const { email } = req.body as SendOtpDTO;

        const user = await this.userRepository.exist({ email });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const existingOtp = this.otpCache[email];
        // if (existingOtp && existingOtp.expiresAt > new Date()) {
        //     return res.status(429).json({
        //         message: "OTP already sent. Please wait before requesting a new one.",
        //     });
        // }

        const otp = generateOtp();
        const expiresAt = generateExpiryDate(2 * 60 * 1000);
        this.otpCache[email] = {
            otp,
            expiresAt,
            verified: false,
            resetToken: null,
        };
        await sendEmail({
            from: `'Apple-Store' <${devConfig.SMTP_EMAIL}>`,
            to: email,
            subject: "Your OTP for password reset",
            html: `
    <div style="
        font-family: Arial, sans-serif; 
        max-width: 600px; 
        margin: auto; 
        border: 2px solid #4CAF50; 
        border-radius: 10px; 
        padding: 20px; 
        background: #fdfde3;
    ">
        <h2 style="color: #4CAF50; text-align: center;">Apple-Store Password Reset</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">
            You requested to reset your password. Please use the OTP below to verify your email:
        </p>
        <div style="
            background-color: #FFEB3B; 
            color: #000; 
            font-size: 28px; 
            font-weight: bold; 
            text-align: center; 
            padding: 15px; 
            border-radius: 8px;
            margin: 20px 0;
        ">
            ${otp}
        </div>
        <p style="font-size: 14px; color: #555;">
            This OTP will expire in 2 minutes. If you did not request this, please ignore this email.
        </p>
        <p style="font-size: 16px; color: #333;">Thank you,<br /><strong>Apple-Store Team</strong></p>
    </div>
`

        });

        res.status(200).json({
            message: "OTP sent successfully",
            success: true,
        });
    };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        const record = this.otpCache[email];

        if (!record) {
            return next(new NotFoundError("OTP not found or expired"));
        }

        if (record.expiresAt < new Date()) {
            delete this.otpCache[email];
            return next(new BadRequestError("OTP expired"));
        }

        if (record.verified) {
            return next(new BadRequestError("OTP already used"));
        }

        if (record.otp !== otp.toString().trim()) {
            return next(new AuthorityError("Invalid OTP"));
        }

        const resetToken = generateToken(
            { email, purpose: "reset-password" },
            undefined,
            { expiresIn: "5m" }
        );

        record.verified = true;
        record.resetToken = resetToken;
        record.otp = "USED";

        res.status(200).json({
            message: "OTP verified successfully",
            resetToken,
        });

    } catch (error) {
        next(error);
    }
};


    public resetPassword = async (req: Request, res: Response) => {
        const { email, newPassword, resetToken } = req.body;
        if (!email || !newPassword || !resetToken) {
            return res.status(400).json({
                message: "Email, new password and reset token are required",
            });
        }

        const record = this.otpCache[email];
        if (
            !record ||
            record.verified !== true ||
            record.resetToken !== resetToken
        ) {
            return res.status(403).json({
                message: "Unauthorized password reset",
            });
        }

        const user = await this.userRepository.exist({ email });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const hashedPassword = await hashing(newPassword);

        await this.userRepository.updated(
            { email },
            { password: hashedPassword }
        );
        delete this.otpCache[email];

        res.status(200).json({
            message: "Password changed successfully",
            success: true,
        });
    };

}
export default new UserService;