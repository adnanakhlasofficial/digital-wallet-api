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
  const data = await Transaction.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "phone", // assuming phone is the match field
        as: "senderDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receiver",
        foreignField: "phone", // same assumption
        as: "receiverDetails",
      },
    },
    {
      $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 0,
        trxId: 1,
        transactionType: 1,
        sender: 1,
        receiver: 1,
        amount: 1,
        fee: 1,
        commission: 1,
        netAmount: 1,
        createdAt: 1,
        senderName: "$senderDetails.name",
        receiverName: "$receiverDetails.name",
      },
    },
  ]);

  return data;
};

export const TransactionService = { sendBonus, getAllTransactions };
