import { env } from "../../configs/env";
import { IUser } from "./user.interface";
import bcrypt from "bcrypt";
import { User } from "./user.model";
import { WalletService } from "../wallet/wallet.service";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

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

const getAllUsers = async (user: IUser) => {
  const data = await User.find({
    $and: [{ role: { $ne: "Admin" } }, { name: { $ne: user?.name } }],
  }).select("-_id -password");
  return data;
};

const getSingleUser = async (email: string) => {
  const data = await User.findOne({ email }).select("-_id -password");
  return data;
};

const setUserVerificationStatus = async (email: string) => {
  const data = await User.findOneAndUpdate(
    { email },
    [
      {
        $set: { isVerified: { $not: "$isVerified" } },
      },
    ],
    { new: true, projection: { _id: 0, password: 0 } }
  );
  if (!data) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Bad Request. The data provided is invalid or incomplete."
    );
  }
  return data;
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  setUserVerificationStatus,
};
