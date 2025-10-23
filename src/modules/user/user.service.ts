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

  const walletCreateInfo = {
    user: user._id,
    email: user.email,
    phone: user.phone,
  };

  const wallet = await WalletService.createWallet(walletCreateInfo);

  const { _id: userID, password, ...safeUser } = user.toObject();
  const { _id: WalletID, user: WalletUser, ...safeWallet } = wallet.toObject();

  return { ...safeUser, ...safeWallet };
};

const getAllUsers = async () => {
  const data = await User.find().select("-_id -password");
  return data;
};

const getSingleUser = async (email: string) => {
  const data = await User.findOne({ email }).select("-_id -password");
  return data;
};

export const UserService = { createUser, getAllUsers, getSingleUser };
