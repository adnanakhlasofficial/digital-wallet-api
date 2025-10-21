import { model, Schema } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interfaces";

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 50 },
    email: { type: String, required: true },
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

export const Wallet = model<IWallet>("Wallet", walletSchema);
