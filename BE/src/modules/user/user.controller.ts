import { Router } from "express";
import userService from "./user.service";
import { validate } from "../../utils/middlewear";
import { createUserSchema, forgetPasswordEmailSchema, loginUserSchema, otpVerficationSchema, resetPasswordSchema } from "./user.validation";
const router = Router();
router.get("/profile", userService.getProfile);
router.post("/register", validate(createUserSchema), userService.register);
router.post("/login", validate(loginUserSchema), userService.login);
router.post("/send-otp",validate(forgetPasswordEmailSchema), userService.sendOtp);
router.post("/verify-otp", validate(otpVerficationSchema),userService.verifyOtp);
router.post("/reset-password",validate(resetPasswordSchema), userService.resetPassword)
export default router;