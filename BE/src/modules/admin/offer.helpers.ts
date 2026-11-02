import { ProductRepository } from "../../models/product/product.repository";
import { OfferRepository } from "../../models/offer/offer.repository";
import { IOffer } from "../../utils/common/interfaces";

export class OfferHelper {
    public static calculateDiscountedPrice(originalPrice: number, discountType: string, discountValue: number): number {
        if (discountType === 'percentage') {
            const discountAmount = originalPrice * (discountValue / 100);
            return Math.max(0, originalPrice - discountAmount);
        } else if (discountType === 'fixed') {
            return Math.max(0, originalPrice - discountValue);
        }
        return originalPrice;
    }

    public static async applyOfferToCategory(category: string, offer: IOffer) {
        const productRepo = new ProductRepository();
        const products = await productRepo.getAllProducts({ category } as any, {}, {});

        await Promise.all(products.map((product) => {
            const originalPrice = (product as any).originalPrice ?? product.price;
            const newPrice = this.calculateDiscountedPrice(originalPrice, offer.discountType, offer.discountValue);
            return productRepo.update(String(product._id), {
                originalPrice: originalPrice,
                price: newPrice
            });
        }));
    }

    public static async revertOfferFromCategory(category: string) {
        const offerRepo = new OfferRepository();
        // Check if there is another active offer for this category with future expiry
        const now = new Date();
        const activeOffers = await offerRepo.getAllOffers({
            category,
            isActive: true,
            expiryDate: { $gt: now } as any
        } as any, {}, { sort: { createdAt: -1 } });

        const productRepo = new ProductRepository();
        const products = await productRepo.getAllProducts({ category } as any, {}, {});

        if (activeOffers.length > 0) {
            // Apply the latest valid active offer
            const latestOffer = activeOffers[0] as unknown as IOffer;
            await Promise.all(products.map((product) => {
                const originalPrice = (product as any).originalPrice ?? product.price;
                const newPrice = this.calculateDiscountedPrice(originalPrice, latestOffer.discountType, latestOffer.discountValue);
                return productRepo.update(String(product._id), {
                    originalPrice: originalPrice,
                    price: newPrice
                });
            }));
        } else {
            // Revert all products in this category to their original price
            await Promise.all(products.map((product) => {
                const originalPrice = (product as any).originalPrice ?? product.price;
                return productRepo.update(String(product._id), {
                    price: originalPrice,
                    originalPrice: originalPrice
                });
            }));
        }
    }

    public static async calculatePriceWithActiveOffers(category: string, price: number): Promise<number> {
        const offerRepo = new OfferRepository();
        const now = new Date();
        const activeOffers = await offerRepo.getAllOffers({
            category,
            isActive: true,
            expiryDate: { $gt: now } as any
        } as any, {}, { sort: { createdAt: -1 } });

        if (activeOffers.length > 0) {
            const latestOffer = activeOffers[0] as unknown as IOffer;
            return this.calculateDiscountedPrice(price, latestOffer.discountType, latestOffer.discountValue);
        }
        return price;
    }
}
