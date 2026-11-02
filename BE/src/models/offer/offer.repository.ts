import { ProjectionType, QueryOptions } from "mongoose";
import { AbstractRepository } from "../../DB/abstract.repository";
import { IOffer } from "../../utils/common/interfaces";
import Offer from "./offer.model";

export class OfferRepository extends AbstractRepository<IOffer> {
    constructor() {
        super(Offer);
    }
    async getAllOffers(filter: Partial<IOffer>, projection: ProjectionType<IOffer>, options: QueryOptions<IOffer>) {
        return await Offer.find(filter, projection, options);
    }
    async findById(id: string) {
        return this.model.findById(id).exec();
    }
    async deleteById(id: string) {
        return this.model.findByIdAndDelete(id).exec();
    }
    async update(id: string, updateData: any) {
        return this.model.findByIdAndUpdate(id, updateData).exec();
    }
}
