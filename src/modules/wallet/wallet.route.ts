import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

router.get("/all", checkAuth(UserRole.ADMIN), WalletController.getAllWallet);
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  WalletController.getWalletMe
);
router.get(
  "/:phone",
  checkAuth(...Object.values(UserRole)),
  WalletController.getSingleWallet
);

export const WalletRouter = router;
