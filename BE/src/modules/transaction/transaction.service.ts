import { NextFunction, Request, Response } from "express";
import { TransactionRepository } from "../../models/transaction/transaction.repository";
import { TransactionDTO } from "./transaction.dto";
import { BadRequestError } from "../../utils/common/Error";
import { ProductRepository } from "../../models/product/product.repository";
import { devConfig } from "../../config/dev.env";
import { sendEmail } from "../../utils/email";
import { sendTelegramMessage } from "../../utils/telegram";
import { OfferHelper } from "../admin/offer.helpers";

const SHIPPING_BY_GOVERNORATE: Record<string, number> = {
    Cairo: 80,
    "Cairo suburbs": 100,
    Giza: 80,
    "Giza suburbs": 100,
    Qalyubia: 80,
    Alexandria: 100,
    Beheira: 100,
    "Marsa Matrouh": 140,
    Dakahlia: 100,
    "Kafr El Sheikh": 100,
    Gharbia: 100,
    Menoufia: 100,
    Damietta: 100,
    "Port Said": 100,
    Ismailia: 100,
    Suez: 100,
    Sharqia: 100,
    "Red Sea": 160,
    Fayoum: 100,
    "Beni Suef": 100,
    Minya: 130,
    Assiut: 140,
    "New Valley": 160,
    Qena: 140,
    Sohag: 140,
    Aswan: 140,
    Luxor: 140,
};
const CASH_ON_DELIVERY_FEE = 2;
const MIN_ORDER_SUBTOTAL = 50;

interface OrderItem {
    productId: string;
    name: string;
    size?: string | undefined;
    quantity: number;
    unitPrice: number;
}

const getItemPrice = async (category: string, price: number) =>
    category === "stickers"
        ? OfferHelper.calculatePriceWithActiveOffers(category, 25)
        : price;

const escapeHtml = (text: unknown) => String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

class TransactionService {
    private transactionRepository = new TransactionRepository();
    private productRepository = new ProductRepository();

    public getTransaction = async (req: Request, res: Response, next: NextFunction) => {
        res.json({ message: "done successfully", success: true });
    }

    public createTransaction = async (req: Request, res: Response, next: NextFunction) => {

        try {

            const newTransaction: TransactionDTO = req.body;
            newTransaction.status = newTransaction.status ?? false;

            const transactionsCount = await this.transactionRepository.count();
            const orderNumber = transactionsCount + 1;

            // ---------- VALIDATE PRODUCTS ----------
            const items: OrderItem[] = [];

            for (const key in newTransaction.products) {

                const productId = key.split("_")[0] as string;
                const info = newTransaction.products[key]!;

                const product = await this.productRepository.findById(productId);

                if (!product) {
                    throw new BadRequestError(`Product with ID ${productId} not found`);
                }

                if (product.stock < info.quantity) {
                    throw new BadRequestError(`Not enough stock for ${product.name}`);
                }

                items.push({
                    productId,
                    name: product.name,
                    size: info.size,
                    quantity: info.quantity,
                    unitPrice: await getItemPrice(product.category, Number(product.price)),
                });
            }

            // ---------- VERIFY TOTAL ----------
            const shipping = Object.prototype.hasOwnProperty.call(SHIPPING_BY_GOVERNORATE, newTransaction.city)
                ? SHIPPING_BY_GOVERNORATE[newTransaction.city]
                : undefined;

            if (shipping === undefined) {
                throw new BadRequestError("Please choose a valid governorate");
            }

            const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

            if (subtotal < MIN_ORDER_SUBTOTAL) {
                throw new BadRequestError(`Please add items worth at least ${MIN_ORDER_SUBTOTAL} LE to proceed.`);
            }

            const expectedTotal = subtotal + shipping + CASH_ON_DELIVERY_FEE;

            if (Math.abs(newTransaction.totalPrice - expectedTotal) > 0.01) {
                throw new BadRequestError("Prices have changed. Please refresh the page and review your order.");
            }

            // ---------- UPDATE STOCK ----------
            for (const item of items) {

                const product = await this.productRepository.findById(item.productId) as any;

                product.stock -= item.quantity;

                await this.productRepository.update(item.productId, { stock: product.stock });
            }

            // ---------- CREATE TRANSACTION ----------
            await this.transactionRepository.create(newTransaction);

            res.status(201).json({
                success: true,
                orderNumber,
                message: "Transaction created successfully."
            });

            // The order is already saved, so a notification failure must not fail the request.
            void this.sendOrderNotifications(newTransaction, orderNumber, items);

        } catch (error) {
            next(error);
        }
    };

    private sendOrderNotifications = async (order: TransactionDTO, orderNumber: number, items: OrderItem[]) => {
        const results = await Promise.allSettled([
            this.sendConfirmationEmail(order, orderNumber, items),
            this.sendTelegramAlert(order, orderNumber, items),
        ]);

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`Order #${orderNumber} ${index === 0 ? "email" : "telegram"} failed:`, result.reason?.message);
            }
        });
    };

    private sendConfirmationEmail = async (order: TransactionDTO, orderNumber: number, items: OrderItem[]) => {
        const productListHtml = items.map((item) => `<tr>
                    <td style="padding:10px;">${escapeHtml(item.name)}${item.size ? ` (${escapeHtml(item.size)})` : ''}</td>
                    <td style="padding:10px; text-align:center;">${item.quantity}</td>
                    <td style="padding:10px; text-align:right;">${item.unitPrice} LE</td>
                </tr>`).join("");

        await sendEmail({
            from: `'Apple Store' <${devConfig.SMTP_EMAIL}>`,
            to: order.email as string,
            subject: `Order Confirmation - #${orderNumber}`,
            html: `
            <div style="font-family: Helvetica, Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;">
                
                <div style="background:#000; padding:20px; text-align:center;">
                    <h1 style="color:#fff; margin:0;">Order Confirmed</h1>
                    <p style="color:#ccc;">Order #${orderNumber}</p>
                </div>

                <div style="padding:30px; color:#333;">
                    
                    <h2>Hi ${escapeHtml(order.name)},</h2>

                    <p>Your order has been placed successfully.</p>

                    <p><strong>Order Number:</strong> #${orderNumber}</p>

                    <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                        <thead>
                            <tr style="background:#f8f8f8;">
                                <th style="padding:10px; text-align:left;">Item</th>
                                <th style="padding:10px; text-align:center;">Qty</th>
                                <th style="padding:10px; text-align:right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productListHtml}
                        </tbody>
                    </table>

                    <div style="text-align:right; margin-top:20px; font-size:18px;">
                        <strong>Total: ${order.totalPrice.toFixed(2)} LE</strong>
                    </div>

                </div>
            </div>
            `
        });
    };

    private sendTelegramAlert = async (order: TransactionDTO, orderNumber: number, items: OrderItem[]) => {
        const productsText = items
            .map((item) => `• ${escapeHtml(item.name)}${item.size ? ` (${escapeHtml(item.size)})` : ''} × ${item.quantity}`)
            .join("\n");

        await sendTelegramMessage(`
🛒 <b>New Order Received</b>

🧾 <b>Order #:</b> ${orderNumber}

👤 <b>Name:</b> ${escapeHtml(order.name)}
📧 <b>Email:</b> ${escapeHtml(order.email)}
📞 <b>Phone:</b> ${escapeHtml(order.phoneNumber)}
🏙 <b>City:</b> ${escapeHtml(order.city)}
📍 <b>Address:</b> ${escapeHtml(order.address)}

📦 <b>Products:</b>
${productsText}

💳 <b>Payment:</b> ${order.paymentMethod.toUpperCase()}
💰 <b>Total:</b> ${order.totalPrice} LE
        `);
    };
}

export default new TransactionService();
