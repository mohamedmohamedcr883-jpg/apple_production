import { v2 as cloudinary } from "cloudinary";
import { devConfig } from "./dev.env";

cloudinary.config({
    cloud_name: devConfig.CLOUDINARY_CLOUD_NAME as string,
    api_key: devConfig.CLOUDINARY_API_KEY as string,
    api_secret: devConfig.CLOUDINARY_API_SECRET as string,
});

export default cloudinary;
