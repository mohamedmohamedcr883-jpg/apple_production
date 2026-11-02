import { Request, Response, NextFunction } from "express";
import { devConfig } from "../../config/dev.env";
import { generateToken } from "../../utils/token";
import { ProductRepository } from "../../models/product/product.repository";
import { TransactionRepository } from "../../models/transaction/transaction.repository";
import { OfferRepository } from "../../models/offer/offer.repository";
import { OfferHelper } from "./offer.helpers";
import cloudinary from "../../config/cloudinary";

class AdminService {
    private productRepository = new ProductRepository();
    private transactionRepository = new TransactionRepository();
    private offerRepository = new OfferRepository();

    // ========== AUTH ==========
    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Email and password are required" });
            }

            if (email !== devConfig.ADMIN_EMAIL || password !== devConfig.ADMIN_PASSWORD) {
                return res.status(401).json({ success: false, message: "Invalid admin credentials" });
            }

            const token = generateToken(
                { email, role: "admin" },
                undefined,
                { expiresIn: "24h" }
            );

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                data: { name: "Admin", email },
            });
        } catch (err) {
            next(err);
        }
    };

    // ========== PRODUCTS ==========
    public createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, price, stock, category, type, description } = req.body;
            const photo = req.file;

            if (!name || price === undefined || !category || !type || !photo) {
                return res.status(400).json({ success: false, message: "Name, price, category, type, and image are required" });
            }

            const originalPrice = Number(price);
            const { secure_url } = await cloudinary.uploader.upload(photo.path, {
                folder: `apple-store/${category}/${type}`
            });

            const product = await this.productRepository.create({
                name,
                price: await OfferHelper.calculatePriceWithActiveOffers(category, originalPrice),
                originalPrice,
                stock: Number(stock || 0),
                category,
                type,
                image: secure_url,
                description: description || "",
            } as any);

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        } catch (err) {
            next(err);
        }
    };

    public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { name, price, stock } = req.body;
            const photo = req.file;

            const product = await this.productRepository.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (price !== undefined) {
                // The price from the frontend is the original price
                const originalPrice = Number(price);
                updateData.originalPrice = originalPrice;
                // Calculate if there's an active offer
                updateData.price = await OfferHelper.calculatePriceWithActiveOffers(product.category, originalPrice);
            }
            if (stock !== undefined) updateData.stock = Number(stock);
            if (photo) {
                const { secure_url } = await cloudinary.uploader.upload(photo.path, {
                    folder: `apple-store/${product.category}/${product.type}`
                });
                updateData.image = secure_url;
            }

            const updated = await this.productRepository.update(id, updateData);
            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: updated,
            });
        } catch (err) {
            next(err);
        }
    };

    public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;

            const product = await this.productRepository.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            await this.productRepository.deleteById(id);
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    // ========== ORDERS ==========
    public getOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const transactions = await this.transactionRepository.getAllTransactions({}, {}, { sort: { createdAt: -1 } });

            // Populate product names for each transaction
            const orders = await Promise.all(
                transactions.map(async (t: any) => {
                    const productsMap = t.products instanceof Map ? t.products : new Map(Object.entries(t.products || {}));
                    const productsArr: any[] = [];

                    for (const [key, value] of productsMap.entries()) {
                        const productId = String(key).split("_")[0] || String(key);
                        const quantity = typeof value === "object" && value !== null
                            ? Number((value as any).quantity)
                            : Number(value);
                        const size = typeof value === "object" && value !== null
                            ? (value as any).size
                            : undefined;
                        const product = await this.productRepository.findById(productId);
                        const name = product ? product.name : "Unknown Product";
                        productsArr.push({
                            name: size ? `${name} (${size})` : name,
                            quantity,
                        });
                    }

                    return {
                        _id: t._id,
                        name: t.name,
                        email: t.email,
                        phone: t.phoneNumber,
                        city: t.city,
                        address: t.address,
                        products: productsArr,
                        totalPrice: t.totalPrice,
                        status: t.status,
                        paymentMethod: t.paymentMethod,
                        createdAt: t.createdAt,
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (err) {
            next(err);
        }
    };

    // ========== OFFERS ==========
    public getOffers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offers = await this.offerRepository.getAllOffers({}, {}, { sort: { createdAt: -1 } });
            return res.status(200).json({
                success: true,
                data: offers,
            });
        } catch (err) {
            next(err);
        }
    };

    public createOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, category, discountType, discountValue, startDate, expiryDate } = req.body;

            if (!title || !category || !discountType || discountValue === undefined || !startDate || !expiryDate) {
                return res.status(400).json({ success: false, message: "All fields are required" });
            }

            const offer = await this.offerRepository.create({
                title,
                category,
                discountType,
                discountValue: Number(discountValue),
                startDate: new Date(startDate),
                expiryDate: new Date(expiryDate),
                isActive: true,
            } as any);

            // Apply offer to all products in the category
            await OfferHelper.applyOfferToCategory(category, offer as any);

            return res.status(201).json({
                success: true,
                message: "Offer created successfully",
                data: offer,
            });
        } catch (err) {
            next(err);
        }
    };

    public deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;

            const offer = await this.offerRepository.findById(id);
            if (!offer) {
                return res.status(404).json({ success: false, message: "Offer not found" });
            }

            await this.offerRepository.deleteById(id);

            // Revert all products in the category (if no other offer is active)
            await OfferHelper.revertOfferFromCategory(offer.category);

            return res.status(200).json({
                success: true,
                message: "Offer deleted successfully",
            });
        } catch (err) {
            next(err);
        }
    };
}

export default new AdminService();
