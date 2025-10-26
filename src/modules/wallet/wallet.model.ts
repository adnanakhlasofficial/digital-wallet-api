import { model, Schema } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interfaces";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 50 },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      default: WalletStatus.ACTIVE,
      enum: {
        values: Object.values(WalletStatus),
        message: "{VALUE} is not acceptable",
      },
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

walletSchema.pre("findOneAndUpdate", async function (next) {
  const doc = await this.model.findOne(this.getQuery()).populate("user");
  if (doc.status !== WalletStatus.ACTIVE || !doc.user.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Funds cannot be transferred to an inactive user or wallet account.`
    );
  }

  next();
});

export const Wallet = model<IWallet>("Wallet", walletSchema);
