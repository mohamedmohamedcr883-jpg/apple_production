import { Double } from "mongoose";

export interface AddProductDTO {
    price: Double;
    originalPrice: Double;
    stock: number;
    image: string;
    category: string;
    type: string;
    description: string;
    name: string;
}
