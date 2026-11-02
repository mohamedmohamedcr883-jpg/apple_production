import { model } from "mongoose";
import productSchema from "../product/product.schema"
import { IProduct } from "../../utils/common/interfaces";

const Product = model<IProduct>("Product", productSchema);
export default Product;