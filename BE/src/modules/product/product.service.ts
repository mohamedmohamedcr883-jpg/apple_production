import { Request, Response } from "express";
import { ProductRepository } from "../../models/product/product.repository";
import { AddProductDTO } from "./product.dto";
import cloudinary from "../../config/cloudinary";
import { ProductFactory } from "./factory";
import { OfferHelper } from "../admin/offer.helpers";

export class ProductService {
    private productRepository = new ProductRepository();
    private productFactory = new ProductFactory();
    constructor() { }
    public getAllProducts = async (req: Request, res: Response) => {
        const dbProducts = await this.productRepository.getAllProducts({}, {}, {});
        const products = dbProducts.map(p => ({
            id: p._id,
            ...p.toObject()
        }));
        res.json({ message: "done successfully", data: products, success: true });
    }
    public addProduct = async (req: Request, res: Response) => {
        const addProductDTO: AddProductDTO = req.body;
        const photo = req.file;
        if (!photo) {
            res.status(400).json({ message: "photo is required", success: false });
            return;
        }
        const { secure_url, public_id } = await cloudinary.uploader.upload(photo.path, {
            folder: `apple-store/${addProductDTO.category}/${addProductDTO.type}`
        })
        addProductDTO.image = secure_url;
        const product = await this.productFactory.addProduct(addProductDTO);

        // Auto-apply active offers for this category
        product.price = await OfferHelper.calculatePriceWithActiveOffers(product.category, Number(product.originalPrice)) as any;

        const newProduct = await this.productRepository.create(product);
        res.json({ message: "product added successfully", data: newProduct, success: true });
    }
}
export default new ProductService;