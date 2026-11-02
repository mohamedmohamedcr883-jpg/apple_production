import { Model, MongooseBaseQueryOptions, MongooseUpdateQueryOptions, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";
import type mongoose from "mongoose";


export abstract class AbstractRepository<T> {
    constructor(protected model: Model<T>) { }
    async create(item: T) {
        const document = await this.model.create(item);
        return await document.save();
    }
    async getOne(filter: Partial<T>, projection?: ProjectionType<T>, options?: QueryOptions) {
        return await this.model.findOne(filter, projection, options)
    }
    async exist(filter: Partial<T>, projection?: ProjectionType<T>, options?: QueryOptions) {
        return await this.model.findOne(filter, projection, options)
    }
    async updated(filter: Partial<T>, item: UpdateQuery<T>, options?: any) {
        await this.model.updateOne(filter, item, options);
    }
    async delete(filter: Partial<T>, options?: MongooseBaseQueryOptions<T>) {
        await this.model.deleteOne(filter, options);
    }
}