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

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const user = req.user;
  const { data, meta } = await UserService.getAllUsers(user, query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully",
    data,
    meta,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const email = req.params.email;
  const data = await UserService.getSingleUser(email);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
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

const setUserVerificationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.params.email;
    const data = await UserService.setUserVerificationStatus(email);
    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: "User verification status has been updated successfully.",
      data,
    });
  }
);

export const UserController = {
  createUser,
  getMe,
  getAllUsers,
  getSingleUser,
  setUserVerificationStatus,
};
