import { OfferRepository } from "../../models/offer/offer.repository";
import { OfferHelper } from "./offer.helpers";
import { log } from "console";

export const scheduleOfferExpiry = () => {
    // Run every 60 seconds
    setInterval(async () => {
        try {
            const offerRepo = new OfferRepository();
            const now = new Date();

            // Find offers that have expired but are still marked as active
            const expiredOffers = await offerRepo.getAllOffers({
                isActive: true,
                expiryDate: { $lte: now } as any
            } as any, {}, {});

            for (const offer of expiredOffers) {
                log(`[CRON] Expiring offer: ${offer.title}`);
                await offerRepo.update(String(offer._id), { isActive: false });
            }

            // Refresh each category so scheduled offers start when due and expired
            // offers are removed from product prices.
            const activeOffers = await offerRepo.getAllOffers({ isActive: true } as any, {}, {});
            const categories = new Set([
                ...expiredOffers.map(offer => offer.category),
                ...activeOffers.map(offer => offer.category),
            ]);
            for (const category of categories) {
                await OfferHelper.revertOfferFromCategory(category);
            }
        } catch (error) {
            log("[CRON] Error during offer expiry check:", error);
        }
    }, 60 * 1000);
};
