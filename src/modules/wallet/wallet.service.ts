import { Types } from "mongoose";
import { Wallet } from "./wallet.model";

const createWallet = async (user: Types.ObjectId, email: string) => {
  const data = await Wallet.create({ user, email });
  return data;
};

export const WalletService = { createWallet };
