import { model, Schema } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    trxId: { type: String, required: true, unique: true },
    transactionType: {
      type: String,
      required: true,
      enum: {
        values: Object.values(TransactionType),
        message: "{VALUE} is not acceptable",
      },
    },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: null },
    commission: { type: Number, default: null },
    netAmount: { type: Number, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
