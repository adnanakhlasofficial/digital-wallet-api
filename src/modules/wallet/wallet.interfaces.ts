import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = "Active",
  BLOCKED = "Blocked",
  SUSPENDED = "Suspended",
}

export interface ICreateWallet {
  user: Types.ObjectId;
  email: string;
  phone: string;
}

export interface IWallet {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  email: string;
  phone: string;
  status: WalletStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
