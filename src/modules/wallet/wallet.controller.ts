import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { WalletService } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const getAllWallet = catchAsync(async (req: Request, res: Response) => {
  const data = await WalletService.getAllWallets();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All wallets retrieved successfully.",
    data,
  });
});

const getSingleWallet = catchAsync(async (req: Request, res: Response) => {
  const phone = req.params.phone;
  const data = await WalletService.getSingleWallet(phone);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Wallet retrieved successfully.",
    data,
  });
});

const getWalletMe = catchAsync(async (req: Request, res: Response) => {
  const email = req.user.email;
  const data = await WalletService.getWalletMe(email);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Wallet retrieved successfully.",
    data,
  });
});

export const WalletController = { getAllWallet, getSingleWallet, getWalletMe };
