import { Router } from "express";
import { AgentController } from "./agent.controller";
import { zodValidate } from "../../middlewares/zod.middleware";
import { AgentRequestZodSchema } from "./agent.zod";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

router.post(
  "/request",
  checkAuth(UserRole.USER),
  zodValidate(AgentRequestZodSchema),
  AgentController.agentRequest
);

router.patch(
  "/request/accept/:email",
  checkAuth(UserRole.ADMIN),
  AgentController.acceptRequest
);
router.patch(
  "/request/reject/:email",
  checkAuth(UserRole.ADMIN),
  AgentController.rejectRequest
);

router.get(
  "/requests",
  checkAuth(UserRole.ADMIN),
  AgentController.getAllAgentRequests
);

export const AgentRouter = router;
