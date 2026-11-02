import { Double, ObjectId } from "mongoose";

export class Product {
    public Id!: ObjectId;
    price!: Double;
    originalPrice!: Double;
    stock!: number
    image!: string;
    category!: string;
    type!: string;
    description!: string;
    name!: string;
}
