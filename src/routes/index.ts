import { Router } from "express";
import { UserRouter } from "../modules/user/user.route";

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
];

routers.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
