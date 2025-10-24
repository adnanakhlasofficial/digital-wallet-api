import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  ITransactionPayload,
  TransactionType,
} from "./transaction.interface";
import { getTransactionId } from "../../utils/trxUtils";
import { Transaction } from "./transaction.model";

const sendBonus = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const totalAmount = payload.amount;

  // Deduct money from sender
  const senderDetails = await Wallet.findOneAndUpdate(
    { phone: sender.phone },
    {
      $inc: { balance: -totalAmount },
    },
    { new: true, projection: { _id: 0, user: 0 } }
  );

  const receiverDetails = await Wallet.findOneAndUpdate(
    { phone: payload.receiver },
    {
      $inc: { balance: totalAmount },
    }
  );

  const transactionPayload: Partial<ITransaction> = {
    trxId: getTransactionId(),
    transactionType: TransactionType.SendBonus,
    sender: senderDetails?.phone,
    receiver: receiverDetails?.phone,
    amount: totalAmount,
  };

  const { _id, ...data } = (
    await Transaction.insertOne(transactionPayload)
  ).toObject();
  return data;
};

const getAllTransactions = async () => {
  const data = await Transaction.find();
  return data;
};

export const TransactionService = { sendBonus, getAllTransactions };
