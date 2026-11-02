import { Schema } from "mongoose";
import { IProduct } from "../../utils/common/interfaces";
import { PRODUCT_CATEGORY, PRODUCT_TYPE } from "../../utils/common/enum";


const schema = new Schema<IProduct>({
    price:
    {
        type: Schema.Types.Double,
        required: true
    },
    originalPrice:
    {
        type: Schema.Types.Double,
        default: null,
    },
    stock: {
        type: Number,
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        enum: Object.values(PRODUCT_CATEGORY),
        required: true,
        default: PRODUCT_CATEGORY.sticker,
    },
    type: {
        type: String,
        enum: Object.values(PRODUCT_TYPE),
        required: true
    },
    name: {
        type: String,
        required: true
    },
});
export default schema;