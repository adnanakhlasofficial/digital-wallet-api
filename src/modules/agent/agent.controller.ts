import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AgentService } from "./agent.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const agentRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { data, isExist } = await AgentService.agentRequest(payload);

  const message = isExist
    ? "An agent request with this email already exists."
    : "Your request has been submitted successfully. Please wait for admin approval.";

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message,
    data,
  });
});

const getAllAgentRequests = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const { data, meta } = await AgentService.getAllAgentRequests(query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All requests retrieved successfully.",
    data,
    meta,
  });
});

export const AgentController = { agentRequest, getAllAgentRequests };
