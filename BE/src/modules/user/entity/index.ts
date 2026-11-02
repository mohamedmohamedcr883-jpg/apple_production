import { ObjectId } from "mongoose";
import { SYS_ROLES, USER_AGENT } from "../../../utils/common/enum";

export class User {
    public name!: string;
    public phone!: string;
    // public role!: SYS_ROLES;
    public password!: string;
    public email!: string;
    // public userAgent!: USER_AGENT;
    // public fullName?: string;
    public otp?: string;
    public otpExpiryDate?: Date;
    // public isVerified!: Boolean;
    // public _id!: ObjectId;
}