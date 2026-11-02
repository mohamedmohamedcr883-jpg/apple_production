import { model } from "mongoose";
import { ITransaction } from "../../utils/common/interfaces/transaction";
import transSchema from "./transaction.schema";

const Transaction = model<ITransaction>("Transaction",transSchema);
export default Transaction;