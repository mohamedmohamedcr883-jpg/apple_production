import { ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import { AbstractRepository } from "../../DB/abstract.repository";
import { IProduct } from "../../utils/common/interfaces";
import Product from "./product.model";

export class ProductRepository extends AbstractRepository<IProduct> {
    constructor() {
        super(Product)
    }
    async getAllProducts(filter: Partial<IProduct>, projection: ProjectionType<IProduct>, options: QueryOptions<IProduct>) {
        return await Product.find(filter, projection, options);
    }
    async findById(id: string) {
        return this.model.findById(id).exec();
    }
    async findDuplicate(name: string, category: string, type: string, excludeId?: string) {
        const escapedName = name.trim().split(/\s+/)
            .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('\\s+');
        return this.model.findOne({
            name: new RegExp(`^\\s*${escapedName}\\s*$`, 'i'),
            category,
            type,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        }).select('_id').exec();
    }
    async update(
        id: string,
        updateData: UpdateQuery<IProduct>,
        options: QueryOptions<IProduct> = { new: true }
    ) {
        return this.model.findByIdAndUpdate(id, updateData, options).exec();
    }
    async deleteById(id: string) {
        return this.model.findByIdAndDelete(id).exec();
    }
}