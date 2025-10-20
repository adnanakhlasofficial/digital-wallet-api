import httpStatus from "http-status-codes";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import AppError from "../helpers/AppError";

export const generateToken = async (
  data: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(data, secret, {
    expiresIn,
  } as SignOptions);
  return token;
};

export const verifyToken = (token: string, secret: string) => {
  const decode = jwt.verify(token, secret);

  if (!decode) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }

  return decode;
};
