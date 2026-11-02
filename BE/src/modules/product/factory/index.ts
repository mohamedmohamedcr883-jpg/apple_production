import { Product } from "../entity";
import { AddProductDTO } from "../product.dto";

export class ProductFactory {
    async addProduct(addProductDTO: AddProductDTO) {
        const product = new Product();
        product.price = addProductDTO.price;
        product.originalPrice = addProductDTO.price; // Store original price before any discount
        product.stock = addProductDTO.stock;
        product.image = addProductDTO.image;
        product.category = addProductDTO.category;
        product.type = addProductDTO.type;
        product.description = addProductDTO.description;
        product.name = addProductDTO.name;
        return product;
    }
}
