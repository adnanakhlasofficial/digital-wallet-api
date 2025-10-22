import { Router } from "express";
import { UserRouter } from "../modules/user/user.route";
import { AuthRouter } from "../modules/auth/auth.route";
import { WalletRouter } from "../modules/wallet/wallet.route";

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
];

routers.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
