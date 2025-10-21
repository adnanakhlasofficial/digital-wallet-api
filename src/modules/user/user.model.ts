import { model, Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";

interface IUserWithId extends IUser {
  id?: string;
}

const userSchema = new Schema<IUserWithId>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      min: 3,
      max: 255,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      immutable: true,
      unique: [true, "This email already exist"],
    },
    phone: {
      type: String,
      required: [true, "User phone number is required"],
      immutable: true,
      unique: [true, "This phone already exist"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: UserRole.USER,
      enum: {
        values: Object.values(UserRole),
        message: "{VALUE} is not acceptable",
      },
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    nid: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      require: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true, // keep virtuals like "wallet"
      transform: function (doc, ret) {
        const { id, ...rest } = ret; // remove the extra "id"
        return rest;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        const { id, ...rest } = ret;
        return rest;
      },
    },
  }
);

userSchema.virtual("wallet", {
  ref: "Wallet",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

export const User = model<IUser>("User", userSchema);
