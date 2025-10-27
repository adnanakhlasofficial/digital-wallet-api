import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AgentService } from "./agent.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const agentRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await AgentService.agentRequest(payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Request completed successfully.",
    data,
  });
});

const getAllAgentRequests = catchAsync(async (req: Request, res: Response) => {
  const data = await AgentService.getAllAgentRequests();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All requests retrieved successfully.",
    data,
  });
});

export const AgentController = { agentRequest, getAllAgentRequests };
