import { Types } from "mongoose";

export interface ITransaction {
  _id: Types.ObjectId;
  trxId: string;
  sender: string;
  receiver: string;
  amount: number;
  fee: number;
  commission?: number;
  netAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ITransactionPayload = Pick<ITransaction, "amount" | "receiver">;
