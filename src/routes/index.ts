import { Router } from "express";
import { UserRouter } from "../modules/user/user.route";
import { AuthRouter } from "../modules/auth/auth.route";
import { WalletRouter } from "../modules/wallet/wallet.route";
import { TransactionRouter } from "../modules/transaction/transaction.route";

interface IRoute {
  path: string;
  router: Router;
}

const router = Router();

const routers: IRoute[] = [
  {
    path: "/user",
    router: UserRouter,
  },
  {
    path: "/auth",
    router: AuthRouter,
  },
  {
    path: "/wallet",
    router: WalletRouter,
  },
  {
    path: "/transaction",
    router: TransactionRouter,
  },
];

routers.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
