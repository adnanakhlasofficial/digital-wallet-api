import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { UserRole } from "../user/user.interface";
import { zodValidate } from "../../middlewares/zod.middleware";
import { transactionPayloadSchema } from "./transaction.zod";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.ADMIN),
  zodValidate(transactionPayloadSchema),
  TransactionController.sendBonus
);

export const TransactionRouter = router;
