import { Router } from "express";

interface IRoute {
  path: string;
  router: Router;
}

const router = Router();

const routers: IRoute[] = [];

routers.forEach((route) => {
  router.use(route.path, route.router);
});

export default router;
