import mongoose from "mongoose"
import { devConfig } from "../config/dev.env";
import { log } from "console";
export async function connectDB() {
    if (!devConfig.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(devConfig.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        maxPoolSize: 10,
    }).then(() => {
        log("DB connected successfully");
    });
}
