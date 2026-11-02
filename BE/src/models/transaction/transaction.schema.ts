import { Schema, Types } from "mongoose";
import { ITransaction } from "../../utils/common/interfaces/transaction";
import { PAYMENT_METHID } from "../../utils/common/enum";

const transSchema = new Schema<ITransaction>(
{
    name: {
        type: String,
         required: true
    },
    email: {
    type: String,
     required: true,
    },
    city:{
          type: String,
         required: true
    },
    address: {
        type: String,
         required: true
    },
    phoneNumber: {
        type: String,
    required: true
    },
    products: {
        type: Map,
        of: new Schema(
            {
                quantity: { type: Number, required: true },
                size: { type: String, required: false },
            },
            { _id: false }
        ),
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHID,
        default:PAYMENT_METHID.cash,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

export default transSchema;
