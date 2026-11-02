import { Router } from "express";
import productService from "./product.service";
import { UploadStream } from "cloudinary";   
import { upload } from '../../config/multer';
const router = Router();
router.post("/add-product",upload.single("photo"),productService.addProduct);
router.get("/get-all-products",productService.getAllProducts);
// router.get("/get-product:id",productService.getProduct);

export default router;