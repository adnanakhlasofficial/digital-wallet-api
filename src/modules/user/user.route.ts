import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { zodValidate } from "../../middlewares/zod.middleware";
import { UserController } from "./user.controller";
import { UserRole } from "./user.interface";
import { CreateUserSchema } from "./user.zod";

const router = Router();

router.post(
  "/create",
  zodValidate(CreateUserSchema),
  UserController.createUser
);

router.get("/all", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

router.get("/me", checkAuth(...Object.values(UserRole)), UserController.getMe);

export const UserRouter = router;
