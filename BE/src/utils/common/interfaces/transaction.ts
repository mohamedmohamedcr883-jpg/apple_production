import { PAYMENT_METHID } from "../enum";

export interface ITransactionProductInfo {
    quantity: number;
    size?: string;
}

export interface ITransaction {
    name: string,
    email: string,
    city: string,
    address: string,
    products: Record<string, ITransactionProductInfo>,
    totalPrice: number,
    paymentMethod: PAYMENT_METHID,
    status: boolean,
    phoneNumber: string,
}
