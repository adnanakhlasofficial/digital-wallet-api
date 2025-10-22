import { Types } from "mongoose";
import { Wallet } from "./wallet.model";
import { ICreateWallet } from "./wallet.interfaces";

const createWallet = async ({ user, email, phone }: ICreateWallet) => {
  const data = await Wallet.create({ user, email, phone });
  return data;
};

const getAllWallets = async () => {
  const data = await Wallet.aggregate([
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

export const WalletService = {
  createWallet,
  getAllWallets,
  getSingleWallet,
  getWalletMe,
};
