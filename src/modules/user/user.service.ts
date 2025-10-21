import { env } from "../../configs/env";
import { IUser } from "./user.interface";
import bcrypt from "bcrypt";
import { User } from "./user.model";
import { WalletService } from "../wallet/wallet.service";

const createUser = async (payload: IUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.BCRYPT_SALT)
  );

  payload.password = hashedPassword;

  const user = await User.create(payload);

  const wallet = await WalletService.createWallet(user._id, user.email);

  const { _id: userID, password, ...safeUser } = user.toObject();
  const { _id: WalletID, user: WalletUser, ...safeWallet } = wallet.toObject();

  return { ...safeUser, ...safeWallet };
};

export const UserService = { createUser };
