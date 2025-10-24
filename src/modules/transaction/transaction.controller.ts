import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";

const sendBonus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.sendMoney(payload, user);
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

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const data = await TransactionService.getAllTransactions();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All transactions retrieved successfully.",
    data,
  });
});

export const TransactionController = {
  sendBonus,
  sendMoney,
  getAllTransactions,
};
