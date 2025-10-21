import AppError from "../../helpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt";
import { env } from "../../configs/env";
import { IAuthCredentials } from "./auth.interface";

export const login = async (payload: IAuthCredentials) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid credentials. Please check your email/phone and password."
    );
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid credentials. Please check your email/phone and password."
    );
  }

  const jwyPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const accessToken = generateToken(
    jwyPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_AT
  );
  const refreshToken = generateToken(
    jwyPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_AT
  );

  return { accessToken, refreshToken };
};

export const AuthService = { login };
