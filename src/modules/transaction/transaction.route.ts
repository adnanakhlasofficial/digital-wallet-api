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

router.post(
  "/cash-in",
  checkAuth(UserRole.AGENT),
  zodValidate(transactionPayloadSchema),
  TransactionController.cashIn
);

router.post(
  "/cash-out",
  checkAuth(UserRole.USER),
  zodValidate(transactionPayloadSchema),
  TransactionController.cashOut
);

router.post(
  "/agent-transfer",
  checkAuth(UserRole.AGENT),
  zodValidate(transactionPayloadSchema),
  TransactionController.agentTransfer
);

router.get(
  "/all",
  checkAuth(UserRole.ADMIN),
  TransactionController.getAllTransactions
);
router.get(
  "/all/my",
  checkAuth(...Object.values(UserRole)),
  TransactionController.getAllMyTransactions
);

export const TransactionRouter = router;
