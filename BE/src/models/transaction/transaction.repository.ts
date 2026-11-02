import { ProjectionType, QueryOptions } from "mongoose";
import { AbstractRepository } from "../../DB/abstract.repository";
import { ITransaction } from "../../utils/common/interfaces/transaction";
import Transaction from "./transaction.model";

export class TransactionRepository extends AbstractRepository<ITransaction>{
        constructor(){
        super(Transaction)
    }
    async count() {
        return this.model.countDocuments();
    }
    async getAllTransactions(filter:Partial<ITransaction>,projection:ProjectionType<ITransaction>,options:QueryOptions<ITransaction>){
       return await Transaction.find(filter,projection,options);
    }
    async createTransaction(transactionData: Partial<ITransaction>) {
        const transaction = await this.model.create(transactionData);
        return transaction.save();
    }
        async findById(id: string) {
        return this.model.findById(id).exec();
    }
}
