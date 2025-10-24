import { Types } from "mongoose";

export enum TransactionType {
  SendBonus = "Send Bonus",
  SendMoney = "Send Money",
  CashIn = "Cash In",
  CashOut = "Cash Out",
}

export interface ITransaction {
  _id: Types.ObjectId;
  trxId: string;
  transactionType: TransactionType;
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
