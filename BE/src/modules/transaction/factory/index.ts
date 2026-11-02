    import { AddProductDTO } from "../../product/product.dto";
    import { Transaction } from "../entity";
import { TransactionDTO } from "../transaction.dto";



 export class TransactionFactory {
    async addProduct(transactionDTO: TransactionDTO) {

        const transaction = new Transaction();
        transaction.name = transactionDTO.name;
        transaction.email = transactionDTO.email;
        transaction.phoneNumber = transactionDTO.phoneNumber;
        transaction.address = transactionDTO.address;
        transaction.products = transactionDTO.products;
        transaction.totalPrice = transactionDTO.totalPrice;
        transaction.paymentMethod = transactionDTO.paymentMethod;
        transaction.status = transactionDTO.status || false;

            return transaction;
        }
        
    }