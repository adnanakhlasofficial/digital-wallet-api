import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../../configs/env";
import AppError from "../../helpers/AppError";
import { AgentService } from "../agent/agent.service";
import { WalletService } from "../wallet/wallet.service";
import { IUser, UserRole } from "./user.interface";
import { User } from "./user.model";
import { AgentRequestStatus } from "../agent/agent.interface";

const createUser = async (payload: IUser) => {
  const hashedPassword = await bcrypt.hash(
    payload.password as string,
    Number(env.BCRYPT_SALT)
  );

  payload.password = hashedPassword;

  const user = new User(payload);

  if (user.role === UserRole.AGENT) {
    user.isVerified = false;
    await AgentService.agentRequest({
      email: user.email,
      message: "A new agent application has been submitted successfully.",
      status: AgentRequestStatus.PENDING,
    });
  }

  const walletCreateInfo = {
    user: user._id,
    email: user.email,
    phone: user.phone,
  };

  const wallet = await WalletService.createWallet(walletCreateInfo);
  const data = await user.save();

  const { _id: userID, password, ...safeUser } = data.toObject();
  const { _id: WalletID, user: WalletUser, ...safeWallet } = wallet.toObject();

  return { ...safeUser, ...safeWallet };
};

const getAllUsers = async (user: JwtPayload, query: any) => {
  const totalUsers = await User.find({
    $and: [{ role: { $ne: "Admin" } }, { name: { $ne: user?.name } }],
  }).countDocuments();
  const currentPage = Number(query.currentPage) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (currentPage - 1) * limit || 0;
  const totalPages = Math.ceil(totalUsers / limit);

  const data = await User.find({
    $and: [{ role: { $ne: "Admin" } }, { name: { $ne: user?.name } }],
  })
    .select("-_id -password")
    .skip(skip)
    .limit(limit);

  const meta = { totalUsers, totalPages, currentPage, limit };

  return { data, meta };
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
