import { Router } from "express";
import { UserController } from "./user.controller";
import { zodValidate } from "../../middlewares/zod.middleware";
import { CreateUserSchema } from "./user.zod";

const router = Router();

router.post("/", zodValidate(CreateUserSchema), UserController.createUser);

export const UserRouter = router;
