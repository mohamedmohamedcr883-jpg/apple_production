import { NextFunction, Request, Response } from "express";
import { TransactionRepository } from "../../models/transaction/transaction.repository";
import { TransactionDTO } from "./transaction.dto";
import { BadRequestError } from "../../utils/common/Error";
import { ProductRepository } from "../../models/product/product.repository";
import { devConfig } from "../../config/dev.env";
import { sendEmail } from "../../utils/email";
import { sendTelegramMessage } from "../../utils/telegram";

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
            for (const key in newTransaction.products) {

                const productId = key.split("_")[0] as string;
                const quantity = newTransaction.products[key]?.quantity as number;

                const product = await this.productRepository.findById(productId);

                if (!product) {
                    throw new BadRequestError(`Product with ID ${productId} not found`);
                }

                if (product.stock < quantity) {
                    throw new BadRequestError(`Not enough stock for ${product.name}`);
                }
            }

            // ---------- UPDATE STOCK ----------
            for (const key in newTransaction.products) {

                const productId = key.split("_")[0] as string;
                const quantity = newTransaction.products[key]?.quantity as number;

                const product = await this.productRepository.findById(productId) as any;

                product.stock -= quantity;

                await this.productRepository.update(productId, { stock: product.stock });
            }

            // ---------- CREATE TRANSACTION ----------
            const transaction = await this.transactionRepository.create(newTransaction);

            // ---------- BUILD PRODUCT LIST ----------
            const productEntries = await Promise.all(
                Object.entries(newTransaction.products).map(async ([key, info]) => {

                    const productId = key.split("_")[0] as string;
                    const product = await this.productRepository.findById(productId);

                    if (!product) return null;

                    const sizeLabel = info.size ? ` (${info.size})` : '';

                    return `<tr>
                    <td style="padding:10px;">${product.name}${sizeLabel}</td>
                    <td style="padding:10px; text-align:center;">${info.quantity}</td>
                    <td style="padding:10px; text-align:right;">${product.price} LE</td>
                </tr>`;
                })
            );

            const productListHtml = productEntries.filter(Boolean).join("");

            // ---------- SEND EMAIL ----------
            await sendEmail({
                from: `'Apple Store' <${devConfig.SMTP_EMAIL}>`,
                to: newTransaction.email as string,
                subject: `Order Confirmation - #${orderNumber}`,
                html: `
            <div style="font-family: Helvetica, Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;">
                
                <div style="background:#000; padding:20px; text-align:center;">
                    <h1 style="color:#fff; margin:0;">Order Confirmed</h1>
                    <p style="color:#ccc;">Order #${orderNumber}</p>
                </div>

                <div style="padding:30px; color:#333;">
                    
                    <h2>Hi ${newTransaction.name},</h2>

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
                        <strong>Total: ${newTransaction.totalPrice.toFixed(2)} LE</strong>
                    </div>

                </div>
            </div>
            `
            });

            // ---------- TELEGRAM PRODUCTS ----------
            const telegramProducts = await Promise.all(
                Object.entries(newTransaction.products).map(async ([key, info]) => {

                    const productId = key.split("_")[0] as string;
                    const product = await this.productRepository.findById(productId);

                    if (!product) return null;

                    const sizeLabel = info.size ? ` (${info.size})` : '';

                    return `• ${product.name}${sizeLabel} × ${info.quantity}`;
                })
            );

            const productsText = telegramProducts.filter(Boolean).join("\n");

            // ---------- SEND TELEGRAM ----------
            await sendTelegramMessage(`
🛒 <b>New Order Received</b>

🧾 <b>Order #:</b> ${orderNumber}

👤 <b>Name:</b> ${newTransaction.name}
📧 <b>Email:</b> ${newTransaction.email}
📞 <b>Phone:</b> ${newTransaction.phoneNumber}
🏙 <b>City:</b> ${newTransaction.city}
📍 <b>Address:</b> ${newTransaction.address}

📦 <b>Products:</b>
${productsText}

💳 <b>Payment:</b> ${newTransaction.paymentMethod.toUpperCase()}
💰 <b>Total:</b> ${newTransaction.totalPrice} LE
        `);

            return res.status(201).json({
                success: true,
                orderNumber,
                message: "Transaction created successfully."
            });

        } catch (error) {
            next(error);
        }
    };
}

export default new TransactionService();
