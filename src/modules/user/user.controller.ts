import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "../user/user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await UserService.createUser(payload);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "User created successfully.",
    data,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const me = req.user;
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "User profile retrieved successfully.",
    data: me,
  });
});

export const UserController = { createUser, getMe };
