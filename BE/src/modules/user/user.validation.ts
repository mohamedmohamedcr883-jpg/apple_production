import { email, z } from 'zod';
import { safeString } from '../../utils/common/validation';

export const createUserSchema = z.object({
    name: safeString(2),
    email: z.string().email("Invalid email address"),
    phone: safeString(11),
    password: safeString(8)
})
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: safeString(1)
})
export const forgetPasswordEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
})
export const otpVerficationSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: safeString(5),
})
export const resetPasswordSchema = z.object({
    newPassword: safeString(8),
    email: z.string().email("Invalid email address"),
    resetToken:z.string(),
})