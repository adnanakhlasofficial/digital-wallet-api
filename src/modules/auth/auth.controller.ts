import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { removeCookie, setCookie } from "../../utils/cookies";
import { cookiesName } from "../../constraints/cookiesName";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await AuthService.login(payload);
  setCookie(res, cookiesName.accessToken, await data.accessToken);
  setCookie(res, cookiesName.refreshToken, await data.refreshToken);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Login successful.",
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  removeCookie(res, cookiesName.accessToken);
  removeCookie(res, cookiesName.refreshToken);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Logout successful.",
  });
});

export const AuthController = { login, logout };
