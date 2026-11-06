import { NextFunction, Request, Response } from "express";
import { TransactionRepository } from "../../models/transaction/transaction.repository";
import { TransactionDTO } from "./transaction.dto";
import { BadRequestError } from "../../utils/common/Error";
import { ProductRepository } from "../../models/product/product.repository";
import { devConfig } from "../../config/dev.env";
import { sendEmail } from "../../utils/email";
import { sendTelegramMessage } from "../../utils/telegram";

const SHIPPING_BY_GOVERNORATE: Record<string, number> = {
    Cairo: 5, Giza: 6, Alexandria: 7, Qalyubia: 6, Sharqia: 7, Dakahlia: 7,
    Beheira: 7, Monufia: 6, Gharbia: 6, "Kafr El Sheikh": 7, Damietta: 7, "Port Said": 8,
    Ismailia: 8, Suez: 8, "North Sinai": 10, "South Sinai": 10, "Red Sea": 10,
    Faiyum: 7, "Beni Suef": 8, Minya: 8, Assiut: 9, Sohag: 9, Qena: 9, Luxor: 9,
    Aswan: 10, "New Valley": 10, Matrouh: 10,
};
const CASH_ON_DELIVERY_FEE = 2;
const MIN_ORDER_SUBTOTAL = 50;
const STICKER_SIZE_PRICES: Record<string, number> = { small: 20, medium: 25 };

interface OrderItem {
    productId: string;
    name: string;
    size?: string | undefined;
    quantity: number;
    unitPrice: number;
}

const getItemPrice = (category: string, price: number, size?: string) =>
    (category === "stickers" && STICKER_SIZE_PRICES[size?.toLowerCase() ?? ""]) || price;

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
                    unitPrice: getItemPrice(product.category, Number(product.price), info.size),
                });
            }

            // ---------- VERIFY TOTAL ----------
            const shipping = SHIPPING_BY_GOVERNORATE[newTransaction.city as string];

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
