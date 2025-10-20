import { model, Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";

const userSchema = new Schema<IUser>(
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
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model<IUser>("User", userSchema);

export default User;
