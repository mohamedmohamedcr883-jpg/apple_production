import { PAYMENT_METHID } from "../../utils/common/enum";

export interface TransactionProductInfo {
    quantity: number;
    size?: string;
}

export interface TransactionDTO {
    name: string;
    email: string;
    city: string;
    address: string;
    phoneNumber: string;
    products: {
        [key: string]: TransactionProductInfo; // productId or productId_size -> { quantity, size? }
    };
    totalPrice: number;
    paymentMethod: PAYMENT_METHID;
    status: boolean;
}
