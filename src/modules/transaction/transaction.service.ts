import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { env } from "../../configs/env";
import AppError from "../../helpers/AppError";
import {
  getCommission,
  getFee,
  getTotalAmount,
  getTransactionId,
} from "../../utils/trxUtils";
import { IUser, UserRole } from "../user/user.interface";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  ITransactionPayload,
  TransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";
import { WalletStatus } from "../wallet/wallet.interfaces";
import { startSession } from "mongoose";

const sendBonus = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const totalAmount = payload.amount;
  const session = await startSession();

  try {
    session.startTransaction();

    // 1️⃣ Fetch both sender and receiver wallets (with users)
    const senderWallet = await Wallet.findOne({ phone: sender.phone }, null, {
      session,
    }).populate<{ user: IUser }>("user");

    const receiverWallet = await Wallet.findOne(
      { phone: payload.receiver },
      null,
      { session }
    ).populate<{ user: IUser }>("user");

    // 2️⃣ Validate wallets
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found.");
    }
    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found.");
    }

    if (
      senderWallet.status !== WalletStatus.ACTIVE ||
      !senderWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Sender wallet is not active or verified."
      );
    }

    if (
      receiverWallet.status !== WalletStatus.ACTIVE ||
      !receiverWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver wallet is not active or verified."
      );
    }

    if (senderWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance.");
    }

    // 3️⃣ Update balances (sender and receiver)
    const updatedSender = await Wallet.findOneAndUpdate(
      { phone: sender.phone },
      { $inc: { balance: -totalAmount } },
      { new: true, session }
    );

    const updatedReceiver = await Wallet.findOneAndUpdate(
      { phone: payload.receiver },
      { $inc: { balance: totalAmount } },
      { new: true, session }
    );

    // 4️⃣ Create transaction record
    const transactionPayload: ITransaction = {
      trxId: getTransactionId(),
      transactionType: TransactionType.SendBonus,
      sender: updatedSender?.phone as string,
      receiver: updatedReceiver?.phone as string,
      amount: totalAmount,
      netAmount: totalAmount,
    };

    const [transaction] = await Transaction.create([transactionPayload], {
      session,
    });

    // 5️⃣ Commit the transaction
    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    console.error("Send Bonus Transaction Failed:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

const sendMoney = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee);
  const session = await startSession();

  try {
    session.startTransaction();

    // 1️⃣ Fetch both sender and receiver wallets
    const senderWallet = await Wallet.findOne({ phone: sender.phone }, null, {
      session,
    }).populate<{ user: IUser }>("user");

    const receiverWallet = await Wallet.findOne(
      { phone: payload.receiver },
      null,
      { session }
    ).populate<{ user: IUser }>("user");

    // 2️⃣ Validate wallets
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found.");
    }
    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found.");
    }

    if (
      senderWallet.status !== WalletStatus.ACTIVE ||
      !senderWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Sender wallet is not active or verified."
      );
    }

    if (
      receiverWallet.status !== WalletStatus.ACTIVE ||
      !receiverWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver wallet is not active or verified."
      );
    }

    if (receiverWallet.user.role !== UserRole.USER) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Send Money transactions are only allowed between USER accounts."
      );
    }

    if (senderWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance.");
    }

    // 3️⃣ Update balances (after validation)
    const updatedSender = await Wallet.findOneAndUpdate(
      { phone: sender.phone },
      { $inc: { balance: -totalAmount } },
      { new: true, session }
    );

    const updatedReceiver = await Wallet.findOneAndUpdate(
      { phone: payload.receiver },
      { $inc: { balance: netAmount } },
      { new: true, session }
    );

    // 4️⃣ Update admin wallet with fee
    await Wallet.findOneAndUpdate(
      { phone: env.ADMIN_PHONE },
      { $inc: { balance: fee } },
      { new: true, session }
    );

    // 5️⃣ Create transaction record
    const transactionPayload: ITransaction = {
      trxId: getTransactionId(),
      transactionType: TransactionType.SendMoney,
      sender: updatedSender?.phone as string,
      receiver: updatedReceiver?.phone as string,
      amount: totalAmount,
      fee,
      netAmount,
    };

    const [data] = await Transaction.create([transactionPayload], { session });

    await session.commitTransaction();
    return data;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw error; // ensure error propagates
  } finally {
    session.endSession();
  }
};

const cashIn = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee);
  const session = await startSession();

  try {
    session.startTransaction();

    // 1️⃣ Fetch both sender (AGENT) and receiver (USER) wallets
    const senderWallet = await Wallet.findOne({ phone: sender.phone }, null, {
      session,
    }).populate<{ user: IUser }>("user");

    const receiverWallet = await Wallet.findOne(
      { phone: payload.receiver },
      null,
      { session }
    ).populate<{ user: IUser }>("user");

    // 2️⃣ Validate wallets
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found.");
    }
    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found.");
    }

    if (
      senderWallet.status !== WalletStatus.ACTIVE ||
      !senderWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent wallet is not active or verified."
      );
    }

    if (
      receiverWallet.status !== WalletStatus.ACTIVE ||
      !receiverWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver wallet is not active or verified."
      );
    }

    if (receiverWallet.user.role !== UserRole.USER) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cash In transactions are only allowed from AGENT to USER accounts."
      );
    }

    if (senderWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance.");
    }

    // 3️⃣ Update balances (Agent loses total, User gains net)
    const updatedSender = await Wallet.findOneAndUpdate(
      { phone: sender.phone },
      { $inc: { balance: -totalAmount } },
      { new: true, session }
    );

    const updatedReceiver = await Wallet.findOneAndUpdate(
      { phone: payload.receiver },
      { $inc: { balance: netAmount } },
      { new: true, session }
    );

    // 4️⃣ Update admin wallet with fee
    await Wallet.findOneAndUpdate(
      { phone: env.ADMIN_PHONE },
      { $inc: { balance: fee } },
      { new: true, session }
    );

    // 5️⃣ Create transaction record
    const transactionPayload: ITransaction = {
      trxId: getTransactionId(),
      transactionType: TransactionType.CashIn,
      sender: updatedSender?.phone as string,
      receiver: updatedReceiver?.phone as string,
      amount: totalAmount,
      fee,
      netAmount,
    };

    const [data] = await Transaction.create([transactionPayload], { session });

    await session.commitTransaction();
    return data;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw error; // ensure error propagates
  } finally {
    session.endSession();
  }
};

const cashOut = async (payload: ITransactionPayload, sender: JwtPayload) => {
  const netAmount = payload.amount;
  const fee = getFee(netAmount);
  const commission = getCommission(netAmount);
  const totalAmount = getTotalAmount(netAmount, fee, commission);

  const session = await startSession();

  try {
    session.startTransaction();

    // 1️⃣ Fetch both sender (USER) and receiver (AGENT) wallets
    const senderWallet = await Wallet.findOne({ phone: sender.phone }, null, {
      session,
    }).populate<{ user: IUser }>("user");

    const receiverWallet = await Wallet.findOne(
      { phone: payload.receiver },
      null,
      { session }
    ).populate<{ user: IUser }>("user");

    // 2️⃣ Validate wallets
    if (!senderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found.");
    }
    if (!receiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found.");
    }

    if (
      senderWallet.status !== WalletStatus.ACTIVE ||
      !senderWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User wallet is not active or verified."
      );
    }

    if (
      receiverWallet.status !== WalletStatus.ACTIVE ||
      !receiverWallet.user.isVerified
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent wallet is not active or verified."
      );
    }

    if (receiverWallet.user.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cash Out transactions are only allowed from USER to AGENT accounts."
      );
    }

    if (senderWallet.balance < totalAmount) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance.");
    }

    // 3️⃣ Update balances
    const updatedSender = await Wallet.findOneAndUpdate(
      { phone: sender.phone },
      { $inc: { balance: -totalAmount } },
      { new: true, session }
    );

    const updatedReceiver = await Wallet.findOneAndUpdate(
      { phone: payload.receiver },
      { $inc: { balance: netAmount + commission } },
      { new: true, session }
    );

    // 4️⃣ Update admin wallet with fee
    await Wallet.findOneAndUpdate(
      { phone: env.ADMIN_PHONE },
      { $inc: { balance: fee } },
      { new: true, session }
    );

    // 6️⃣ Create transaction record
    const transactionPayload: ITransaction = {
      trxId: getTransactionId(),
      transactionType: TransactionType.CashOut,
      sender: updatedSender?.phone as string,
      receiver: updatedReceiver?.phone as string,
      amount: totalAmount,
      fee,
      commission,
      netAmount,
    };

    const [data] = await Transaction.create([transactionPayload], { session });

    await session.commitTransaction();
    return data;
  } catch (error) {
    await session.abortTransaction();
    console.error("Cash Out Transaction Failed:", error);
    throw error;
  } finally {
    session.endSession();
  }
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
