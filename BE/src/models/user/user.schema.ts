import mongoose, { Schema } from "mongoose";
import { IUser } from "../../utils/common/interfaces";
import {  SYS_ROLES, USER_AGENT } from "../../utils/common/enum";
// import { devConfig } from "../../config/dev.env";
// import { sendEmail } from "../../utils/mailer";
const schema = new Schema<IUser>({
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxLength: 50,
        trim: true
    },
    // credentialsUpdatedAt: {
    //     type: Date,
    //     default: Date.now()
    // },
    email: {
        type: String,
        unique: true,
    },
    // userAgent: {
    //     type: String,
    //     enum: USER_AGENT,
    //     default: USER_AGENT.local,
    //     lowercase: true
    // },
    password: {
        type: String,
        required: function () {
            // if (this.userAgent == USER_AGENT.google) {
            //     return false;
            // }
            return true;
        }
    },
    phone: {
        type: String,
        length: 11
    },
    otp: {
        type: String,
    },
    otpExpiryDate: {
        type: Date,
        default: Date.now()
    },

// }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
// schema.virtual("fullName").get(function () {
//     return this.firstName + " " + this.lastName;
})
// schema.pre("save", { document: true, query: false }, async function () {
//     if (this.isNew == true && this.userAgent != USER_AGENT.google) {
//         await sendEmail({
//             from: `'social-app' <${devConfig.SMTP_EMAIL}>`,
//             to: this.email as string,
//             subject: "Verify your account",
//             html: `<h1>Your OTP is ${this.otp}</h1>`,
//         });
//     }
// })
export default schema;