import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { TransactionService } from "./transaction.service";

const sendBonus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const data = await TransactionService.sendBonus(payload, user);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Bonus transaction completed.",
    data,
  });
});

export const TransactionController = { sendBonus };
