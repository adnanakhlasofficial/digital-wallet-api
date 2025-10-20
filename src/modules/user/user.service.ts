import { env } from "../../configs/env";
import { IUser } from "./user.interface";
import User from "./user.model";
import bcrypt from "bcrypt";

const createUser = async (payload: IUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.BCRYPT_SALT)
  );

  payload.password = hashedPassword;

  const user = await User.create(payload);

  const { _id, password, ...data } = user.toObject();

  return data;
};

export const UserService = { createUser };
