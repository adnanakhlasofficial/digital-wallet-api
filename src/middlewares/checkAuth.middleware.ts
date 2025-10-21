import { NextFunction, Request, Response } from "express";
import AppError from "../helpers/AppError";
import { verifyToken } from "../utils/jwt";
import { cookiesName } from "../constraints/cookiesName";
import httpStatus from "http-status-codes";
import { env } from "../configs/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";

export const checkAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[cookiesName.accessToken];

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Authentication required. Please log in to continue."
        );
      }

      const isTokenValid = verifyToken(
        token,
        env.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const user = await User.findOne({ email: isTokenValid.email }).populate(
        "wallet",
        "balance email status -_id -user"
      );

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      if (!roles.includes(isTokenValid.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "Forbidden access. You do not have permission to perform this action."
        );
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
