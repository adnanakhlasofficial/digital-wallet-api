import { env } from "../../configs/env";
import AppError from "../../helpers/AppError";
import { ICreateWallet, WalletStatus } from "./wallet.interfaces";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";

const createWallet = async ({ user, email, phone }: ICreateWallet) => {
  const data = await Wallet.create({ user, email, phone });
  return data;
};

const getAllWallets = async () => {
  const data = await Wallet.aggregate([
    {
      $match: {
        email: { $ne: env.ADMIN_EMAIL },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $addFields: {
        name: "$user.name",
        phone: "$user.phone",
        role: "$user.role",
      },
    },
    {
      $project: {
        user: 0,
        _id: 0,
      },
    },
  ]);
  return data;
};

const getSingleWallet = async (phone: string) => {
  const data = await Wallet.aggregate([
    {
      $match: {
        phone,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $addFields: {
        name: "$user.name",
        email: "$user.email",
        phone: "$user.phone",
        nid: "$user.nid",
        role: "$user.role",
      },
    },
    {
      $project: {
        user: 0,
        _id: 0,
      },
    },
  ]);
  return data[0];
};

const getWalletMe = async (email: string) => {
  const data = await Wallet.findOne({ email }).select("-_id -user");
  return data;
};

const setWalletStatus = async (phone: string, status: WalletStatus) => {
  if (!status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Bad Request. The data provided is invalid or incomplete."
    );
  }
  const data = Wallet.findOneAndUpdate(
    { phone },
    {
      $set: {
        status,
      },
    },
    {
      new: true,
      projection: { _id: 0 },
    }
  );

  if (!data) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Bad Request. The data provided is invalid or incomplete."
    );
  }
  return data;
};

export const WalletService = {
  createWallet,
  getAllWallets,
  getSingleWallet,
  getWalletMe,
  setWalletStatus,
};
