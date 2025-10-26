import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  ITransactionPayload,
  TransactionType,
} from "./transaction.interface";
import {
  getCommission,
  getFee,
  getTotalAmount,
  getTransactionId,
} from "../../utils/trxUtils";
import { Transaction } from "./transaction.model";
import { IUser, UserRole } from "../user/user.interface";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";
import { env } from "../../configs/env";

const sendBonus = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const totalAmount = payload.amount;

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
    },
    { new: true }
  );

  if (!receiverDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, "Request user not found.");
  }

  const transactionPayload: Partial<ITransaction> = {
    trxId: getTransactionId(),
    transactionType: TransactionType.SendBonus,
    sender: senderDetails?.phone,
    receiver: receiverDetails?.phone,
    amount: totalAmount,
    netAmount: totalAmount,
  };

  const { _id, ...data } = (
    await Transaction.insertOne(transactionPayload)
  ).toObject();
  return data;
};

const sendMoney = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee);

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
      $inc: { balance: netAmount },
    },
    { new: true }
  ).populate<{ user: IUser }>("user");

  if (!receiverDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, "Request user not found.");
  }

  if (receiverDetails?.user?.role !== UserRole.USER) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Send Money transactions are only allowed between USER accounts"
    );
  }

  await Wallet.findOneAndUpdate(
    { phone: env.ADMIN_PHONE },
    {
      $inc: { balance: fee },
    },
    { new: true, projection: { _id: 0, user: 0 } }
  );

  const transactionPayload: Partial<ITransaction> = {
    trxId: getTransactionId(),
    transactionType: TransactionType.SendMoney,
    sender: senderDetails?.phone,
    receiver: receiverDetails?.phone,
    amount: totalAmount,
    fee,
    netAmount,
  };

  const { _id, ...data } = (
    await Transaction.insertOne(transactionPayload)
  ).toObject();

  return transactionPayload;
};

const cashIn = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee);

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
      $inc: { balance: netAmount },
    },
    { new: true }
  ).populate<{ user: IUser }>("user");

  if (!receiverDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, "Request user not found.");
  }

  if (receiverDetails?.user?.role !== UserRole.USER) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Cash In transactions are only allowed between AGENT to USER accounts"
    );
  }

  await Wallet.findOneAndUpdate(
    { phone: env.ADMIN_PHONE },
    {
      $inc: { balance: fee },
    },
    { new: true, projection: { _id: 0, user: 0 } }
  );

  const transactionPayload: Partial<ITransaction> = {
    trxId: getTransactionId(),
    transactionType: TransactionType.CashIn,
    sender: senderDetails?.phone,
    receiver: receiverDetails?.phone,
    amount: totalAmount,
    fee,
    netAmount,
  };

  const { _id, ...data } = (
    await Transaction.insertOne(transactionPayload)
  ).toObject();

  return transactionPayload;
};

const cashOut = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const commission = getCommission(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee, commission);

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
      $inc: { balance: netAmount },
    },
    { new: true }
  ).populate<{ user: IUser }>("user");

  if (!receiverDetails) {
    throw new AppError(httpStatus.BAD_REQUEST, "Request user not found.");
  }

  if (receiverDetails?.user?.role !== UserRole.AGENT) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Cash Out transactions are only allowed between USER to AGENT accounts"
    );
  }

  await Wallet.findOneAndUpdate(
    { phone: env.ADMIN_PHONE },
    {
      $inc: { balance: fee },
    },
    { new: true, projection: { _id: 0, user: 0 } }
  );

  const transactionPayload: Partial<ITransaction> = {
    trxId: getTransactionId(),
    transactionType: TransactionType.CashOut,
    sender: senderDetails?.phone,
    receiver: receiverDetails?.phone,
    amount: totalAmount,
    fee,
    commission,
    netAmount,
  };

  const { _id, ...data } = (
    await Transaction.insertOne(transactionPayload)
  ).toObject();

  return transactionPayload;
};

const getAllTransactions = async (query: any) => {
  const totalTransactions = await Transaction.countDocuments();
  const currentPage = Number(query.currentPage) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (currentPage - 1) * limit || 0;
  const totalPages = Math.ceil(totalTransactions / limit);

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
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  const meta = { totalTransactions, totalPages, currentPage, limit };
  return { data, meta };
};

const getAllMyTransactions = async (user: JwtPayload, query: any) => {
  const totalTransactions = await Transaction.find({
    $or: [{ sender: user.phone }, { receiver: user.phone }],
  }).countDocuments();
  const currentPage = Number(query.currentPage) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (currentPage - 1) * limit || 0;
  const totalPages = Math.ceil(totalTransactions / limit);

  const data = await Transaction.aggregate([
    {
      $match: {
        $or: [{ sender: user.phone }, { receiver: user.phone }],
      },
    },
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
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  const meta = { totalTransactions, totalPages, currentPage, limit };

  return { data, meta };
};

export const TransactionService = {
  sendBonus,
  sendMoney,
  cashIn,
  cashOut,
  getAllTransactions,
  getAllMyTransactions,
};
