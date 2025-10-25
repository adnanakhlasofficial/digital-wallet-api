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

router.get(
  "/all",
  checkAuth(...Object.values(UserRole)),
  UserController.getAllUsers
);

router.get("/me", checkAuth(...Object.values(UserRole)), UserController.getMe);
router.get("/:email", checkAuth(UserRole.ADMIN), UserController.getSingleUser);
router.patch(
  "/:email",
  checkAuth(UserRole.ADMIN),
  UserController.setUserVerificationStatus
);

export const UserRouter = router;
