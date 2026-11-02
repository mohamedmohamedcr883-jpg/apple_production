import { Router } from "express";
import transactionService from "./transaction.service";
import { createTransactionSchema } from "./transaction.schema";
import { validate } from "../../utils/middlewear";


const router = Router();

router.get("/trans", transactionService.getTransaction);

router.post("/add",  validate(createTransactionSchema), transactionService.createTransaction);

export default router;
