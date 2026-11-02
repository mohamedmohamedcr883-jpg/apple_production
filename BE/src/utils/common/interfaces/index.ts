import { Double, ObjectId } from "mongoose";
import { SYS_ROLES, USER_AGENT } from "../enum";

export interface IUser {
    name: string,
    phone: string,
    // role: SYS_ROLES,
    password: string,
    email: string,
    // userAgent: USER_AGENT,
    otp?: string,
    otpExpiryDate?: Date,
    // isVerified: Boolean,
}
export interface IProduct {
    price: Double;
    originalPrice: Double;
    stock: number;
    image: string;
    category: string;
    type: string;
    description: string;
    name: string;
}
export interface OtpRecord {
    otp: string;
    expiresAt: Date;
    verified: boolean;
    resetToken?: string | null;
}
export interface IOffer {
    title: string;
    category: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: Date;
    expiryDate: Date;
    isActive: boolean;
}