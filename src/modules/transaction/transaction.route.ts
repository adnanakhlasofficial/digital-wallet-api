import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { UserRole } from "../user/user.interface";
import { zodValidate } from "../../middlewares/zod.middleware";
import { transactionPayloadSchema } from "./transaction.zod";

const router = Router();

router.post(
  "/send-bonus",
  checkAuth(UserRole.ADMIN),
  zodValidate(transactionPayloadSchema),
  TransactionController.sendBonus
);

router.post(
  "/send-money",
  checkAuth(UserRole.USER),
  zodValidate(transactionPayloadSchema),
  TransactionController.sendMoney
);

router.get(
  "/all",
  checkAuth(UserRole.ADMIN),
  TransactionController.getAllTransactions
);

export const TransactionRouter = router;
