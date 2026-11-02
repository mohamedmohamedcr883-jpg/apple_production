import { ObjectId } from "mongoose";
import { PAYMENT_METHID } from "../../../utils/common/enum";
import { ITransactionProductInfo } from "../../../utils/common/interfaces/transaction";

export class Transaction {
    name!: string;
    email!: string;
    city!:string;
    address!: string;
    products!: Record<string, ITransactionProductInfo>;
    totalPrice!: number;
    paymentMethod!: PAYMENT_METHID;
    _id!: ObjectId;
    status!: boolean;
    phoneNumber!: string;
}