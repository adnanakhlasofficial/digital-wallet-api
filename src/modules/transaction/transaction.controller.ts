import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";

const sendBonus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.sendBonus(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Bonus transaction successful.",
    data,
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.sendMoney(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Send Money transaction successful.",
    data,
  });
});

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.cashIn(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Cash In transaction successful.",
    data,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.cashOut(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Cash Out transaction successful.",
    data,
  });
});

const agentTransfer = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.agentTransfer(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Agent Transfer transaction successful.",
    data,
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const { data, meta } = await TransactionService.getAllTransactions(query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All transactions retrieved successfully.",
    data: data,
    meta: meta,
  });
});

const getAllMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const user = req.user;
  const { data, meta } = await TransactionService.getAllMyTransactions(
    user,
    query
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All transactions retrieved successfully.",
    data: data,
    meta: meta,
  });
});

export const TransactionController = {
  sendBonus,
  sendMoney,
  cashIn,
  cashOut,
  agentTransfer,
  getAllTransactions,
  getAllMyTransactions,
};
